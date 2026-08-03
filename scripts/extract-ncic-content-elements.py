import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

import pdfplumber


def normalize(value):
    return re.sub(r"[\s·⋅ㆍ・<>()\[\]]+", "", value or "").lower()


def split_bullets(text):
    items = []
    current = None
    for raw_line in (text or "").splitlines():
        line = raw_line.rstrip()
        starts = list(re.finditer(r"(?:(?<=\s)|^)⋅\s*", line))
        if starts:
            if current:
                items.append(current.strip())
            for index, match in enumerate(starts):
                end = starts[index + 1].start() if index + 1 < len(starts) else len(line)
                value = line[match.end():end].strip()
                if index + 1 < len(starts):
                    if value:
                        items.append(value)
                else:
                    current = value
        elif current:
            continuation = line.strip()
            if continuation and not re.fullmatch(r"\d+", continuation) and len(continuation) < 90:
                current = f"{current} {continuation}".strip()
    if current:
        items.append(current.strip())
    return items


def clean_items(items):
    cleaned = []
    for item in items:
        item = re.sub(r"\s+", " ", item).strip(" ·⋅ㆍ-–—")
        item = re.sub(r"\s+(?:과정[⋅·]기능|가치[⋅·]태도|성취기준).*$", "", item)
        for part in re.split(r"\s*[,，]\s*", item):
            part = part.strip(" ·⋅ㆍ-–—")
            if not part or len(part) > 55:
                continue
            if re.search(r"(?:하기|한다|하도록|할 수|기른다|태도)$", part):
                continue
            if part in {"내용 요소", "지식 이해", "지식⋅이해", "지식·이해"}:
                continue
            cleaned.append(part)
    return cleaned


def load_course_index(ontology_root):
    courses = {}
    source_courses = defaultdict(set)
    for level in ("middle", "high"):
        base = ontology_root / "data" / "kr" / level
        course_data = json.loads((base / "courses.json").read_text(encoding="utf-8"))
        standard_data = json.loads((base / "standards.json").read_text(encoding="utf-8"))
        for course in course_data["records"]:
            courses[course["id"]] = {
                "id": course["id"],
                "name": course["labelKorean"],
                "level": level,
            }
        for standard in standard_data["records"]:
            for source_id in standard.get("sourceRefs", []):
                source_courses[source_id].add(standard["courseId"])
    return courses, source_courses


def resolve_heading(heading, candidate_ids, courses):
    key = normalize(heading)
    exact = [course_id for course_id in candidate_ids if normalize(courses[course_id]["name"]) == key]
    if exact:
        return exact[0]
    contained = [course_id for course_id in candidate_ids if key and (key in normalize(courses[course_id]["name"]) or normalize(courses[course_id]["name"]) in key)]
    return contained[0] if len(contained) == 1 else None


def crop_middle_knowledge(page):
    words = page.extract_words()
    middle_headers = [word for word in words if normalize(word["text"]) == normalize("중학교")]
    knowledge = [word for word in words if "지식" in word["text"] and "이해" in word["text"]]
    process = [word for word in words if "과정" in word["text"] and "기능" in word["text"]]
    if not middle_headers or not knowledge:
        return []
    x0 = min(word["x0"] for word in middle_headers) - 4
    top = min(word["top"] for word in knowledge) - 2
    bottom = min((word["top"] for word in process if word["top"] > top), default=page.height - 30)
    if bottom <= top:
        return []
    text = page.crop((x0, top, page.width - 20, bottom)).extract_text(layout=True)
    return clean_items(split_bullets(text))


def crop_social_knowledge(page):
    """Extract the knowledge/understanding row from the social-studies tables.

    These PDFs print the category label vertically, so the generic line-based
    parser never sees `지식·이해` as one continuous line.
    """
    words = page.extract_words()
    content_words = [word for word in words if word["text"] == "내용" and word["top"] > 250]
    element_words = [word for word in words if word["text"] == "요소" and word["top"] > 250]
    process_words = [word for word in words if "과정" in word["text"] and "기능" in word["text"]]
    if not content_words or not element_words or not process_words:
        return [], False

    header_top = min(
        word["top"]
        for word in content_words
        if any(abs(word["top"] - element["top"]) < 3 for element in element_words)
    )
    process_top = min((word["top"] for word in process_words if word["top"] > header_top), default=None)
    if process_top is None:
        return [], False

    middle_headers = [word for word in words if word["text"] == "중학교" and abs(word["top"] - header_top) < 40]
    is_middle = bool(middle_headers)
    x0 = min(word["x0"] for word in middle_headers) - 55 if is_middle else 160
    text = page.crop((max(0, x0), header_top + 20, page.width - 10, process_top - 2)).extract_text(layout=True)
    return clean_items(split_bullets(text)), is_middle


def extract_pdf(pdf_path, source_id, candidate_ids, courses):
    by_course = defaultdict(list)
    middle_candidates = [course_id for course_id in candidate_ids if courses[course_id]["level"] == "middle"]
    current_course = middle_candidates[0] if len(middle_candidates) == 1 else None
    knowledge_active = False

    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            layout = page.extract_text(layout=True) or ""
            # Most high-school subject sections use a large centered title
            # (for example "물리학") instead of an angle-bracket heading.
            # Match short, standalone layout lines against the ontology course
            # names so the following content-system table is assigned to the
            # actual course rather than falling back to its broad domains.
            for line in layout.splitlines():
                heading = line.strip()
                if not heading or len(heading) > 40:
                    continue
                heading_key = normalize(heading)
                exact = [course_id for course_id in candidate_ids if normalize(courses[course_id]["name"]) == heading_key]
                if exact:
                    current_course = exact[0]
                    knowledge_active = False

            for heading in re.findall(r"<\s*([^>\n]+?)\s*>", layout):
                resolved = resolve_heading(heading, candidate_ids, courses)
                if resolved:
                    current_course = resolved
                    knowledge_active = False

            if source_id.endswith("annex7"):
                social_items, is_middle_table = crop_social_knowledge(page)
                if social_items:
                    eligible = middle_candidates if is_middle_table else [course_id for course_id in candidate_ids if courses[course_id]["level"] == "high"]
                    target = current_course if current_course in eligible else (eligible[0] if len(eligible) == 1 else None)
                    if target:
                        for item in social_items:
                            by_course[target].append({"name": item, "category": "지식·이해", "page": page_number, "sourceId": source_id})
                    continue

            middle_items = crop_middle_knowledge(page)
            if middle_items and middle_candidates:
                target = current_course if current_course in middle_candidates else (middle_candidates[0] if len(middle_candidates) == 1 else None)
                if target:
                    for item in middle_items:
                        by_course[target].append({"name": item, "category": "지식·이해", "page": page_number, "sourceId": source_id})
                continue

            for line in layout.splitlines():
                compact = normalize(line)
                if "지식이해" in compact:
                    knowledge_active = True
                if "과정기능" in compact or "가치태도" in compact or "성취기준" in compact and "내용체계" not in compact:
                    knowledge_active = False
                if not knowledge_active or not current_course:
                    continue
                for item in clean_items(split_bullets(line)):
                    by_course[current_course].append({"name": item, "category": "지식·이해", "page": page_number, "sourceId": source_id})

    return by_course


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-root", default=".")
    parser.add_argument("--ontology-root", required=True)
    parser.add_argument("--only-source")
    args = parser.parse_args()
    project_root = Path(args.project_root).resolve()
    ontology_root = Path(args.ontology_root).resolve()
    receipts = json.loads((project_root / "sources" / "ncic" / "collection-receipts.json").read_text(encoding="utf-8"))
    courses, source_courses = load_course_index(ontology_root)
    merged = defaultdict(list)

    for index, source in enumerate(receipts["sources"], start=1):
        # Annexes 5-14 contain the general middle/high-school subjects used by
        # the site. Later annexes are vocational/specialized curricula and can
        # be very large without mapping to the current ontology course list.
        if source.get("annex", 999) > 14:
            continue
        source_id = source["id"]
        if args.only_source and source_id != args.only_source:
            continue
        candidates = source_courses.get(source_id, set())
        if not candidates:
            continue
        pdf_path = project_root / source["localFile"]
        extracted = extract_pdf(pdf_path, source_id, candidates, courses)
        for course_id, items in extracted.items():
            merged[course_id].extend(items)
        print(f"{index:02d}/{receipts['sourceCount']} {source_id}: {sum(len(items) for items in extracted.values())} elements", flush=True)

    output_courses = []
    for course_id, course in courses.items():
        seen = set()
        items = []
        for item in merged.get(course_id, []):
            key = normalize(item["name"])
            if not key or key in seen:
                continue
            seen.add(key)
            items.append(item)
        if items:
            output_courses.append({**course, "elements": items})

    output = {
        "kind": "official-curriculum-content-elements",
        "scope": "knowledge-understanding",
        "courseCount": len(output_courses),
        "elementCount": sum(len(course["elements"]) for course in output_courses),
        "courses": output_courses,
    }
    destination = project_root / "sources" / "ncic" / "content-elements.json"
    destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {output['elementCount']} elements for {output['courseCount']} courses to {destination}")


if __name__ == "__main__":
    main()

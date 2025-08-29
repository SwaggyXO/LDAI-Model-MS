import json
import fitz
import re
import requests
import sys
from keywordgen import keywordGenerator

def getFileInfo(pdf_path):
    file_name = re.search(r'/([^/]+)\.pdf', pdf_path).group(1)
    [grade, subject, chapterName] = file_name.split("-")
    return (grade, subject, chapterName)

def extract_questions_and_answers(pdf_path):
    response = requests.get(pdf_path)
    response.raise_for_status()

    doc = fitz.open(stream=response.content, filetype="pdf")
    data = []
    sections = ["VERY SHORT ANSWER", "SHORT ANSWER", "LONG ANSWER"]
    current_section = None

    (grade, subject, chapterName) = getFileInfo(pdf_path)

    for page_num in range(doc.page_count):
        page = doc[page_num]
        text = page.get_text()

        for section in sections:
            if section in text:
                current_section = section
                break

        # Define your pattern to identify questions and answers
        question_pattern = re.compile(
            r'Q\. \d+\.(.*?)(?=(?:Q\. \d+\. |Ans\.|$))', re.DOTALL)
        answer_pattern = re.compile(
            r'Ans\.(.*?)(?=(?:Q\. \d+\. |Ans\.|$))', re.DOTALL)

        # Extract questions and answers
        question_matches = question_pattern.findall(text)
        answer_matches = answer_pattern.findall(text)

        for q_match, ans_match in zip(question_matches, answer_matches):
            question_text = q_match.replace('\n', ' ')
            answer_text = ans_match.replace('\n', ' ')
            entsList = keywordGenerator(answer_text.strip())
            chapterNameList = chapterName.split("_")

            for i in range(len(chapterNameList)):
                chapterNameList[i] = chapterNameList[i].lower()

            chapterName = " ".join(chapterNameList)

            # Create JSON object
            json_obj = {
                "subject": subject.lower(),
                "chapter": chapterName,
                "grade": grade,
                "questionType": current_section,
                "question": question_text.strip(),
                "paraphrased": "",
                "answer": answer_text.strip(),
                "keywords": entsList,
                "isUsed": False
            }

            data.append(json_obj)

    doc.close()
    return data


# def save_to_json(data, json_path, txt_path):
#     with open(json_path, 'w', encoding='utf-16') as json_file:
#         json.dump(data, json_file, indent=4, ensure_ascii=False)

#     with open(txt_path, 'w', encoding='utf-16') as txt_file:
#         json.dump(data, txt_file, ensure_ascii=False)


# # Example usage:
pdf_path = sys.argv[1]
# output_json_path = r"data\10-hist-ch1.json"
# output_text_path = r'data\10-hist-ch1.txt'

questions_and_answers = extract_questions_and_answers(pdf_path)
# save_to_json(questions_and_answers, output_json_path, output_text_path)
print(json.dumps(questions_and_answers))

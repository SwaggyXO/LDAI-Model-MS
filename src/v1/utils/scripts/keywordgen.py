import spacy
import sys
import json

def keywordGenerator(str_in='') -> list:
    nlp = spacy.load(r'Spacy/output-accuracy/model-best')
    doc = nlp(str_in)
    entsList = list(set([str(ent).lower().replace('.', '') for ent in doc.ents]))
    return entsList

if __name__ == "__main__":
    ans=sys.argv[1]
    print(json.dumps(keywordGenerator(ans)))
# Spacy -> pre-training phase to G.A for public with libs to fine-tune and do other things to the model.
# Using Spacy for NER (Named Entity Recognition) to extract keywords from the text.
import re
from torch import IntTensor
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer, util
import sys
import json
from keywordgen import keywordGenerator

def preprocess_keys(words):
    preprocessed_words = []
    for word in words:
        # Convert word to lowercase
        word = word.lower()
        # Remove trailing spaces
        word = word.strip()
        # Remove punctuation using regular expression
        word = re.sub(r'[^\w\s]', '', word)
        preprocessed_words.append(word)
    return preprocessed_words

def similarityScore(user_ans, bench_ans):

    model = SentenceTransformer(
        'sentence-transformers/bert-base-nli-mean-tokens')

    user_embedding = model.encode([user_ans], convert_to_tensor=True)
    bench_embedding = model.encode([bench_ans], convert_to_tensor=True)

    cosine_scores = util.cos_sim(user_embedding, bench_embedding)
    # score = 1 / (1 + math.exp(IntTensor.item(cosine_scores[0][0])))
    return IntTensor.item(cosine_scores[0][0])


def get_word_importance(paragraph, num_words=3):
    # Initialize KeyBERT model
    model = KeyBERT('distilbert-base-nli-mean-tokens')

    # Extract keywords and their importance scores
    keywords = model.extract_keywords(
        paragraph, keyphrase_ngram_range=(1, num_words), top_n=1000)

    # Organize keywords and their scores into a dictionary
    word_importance = {keyword: score for keyword, score in keywords}
    return word_importance


def importance_of_keywords_with_entities(paragraph, ents_list):

    word_importance = get_word_importance(paragraph)

    # Filter word importance based on entities
    importance_with_entities = {entity: word_importance.get(
        entity, 0) for entity in ents_list}

    return importance_with_entities


def finalScore(user_ans, bench_ans, bench_keys):

    simScore = similarityScore(user_ans=user_ans, bench_ans=bench_ans)

    user_keys = keywordGenerator(user_ans)
    user_keys = preprocess_keys(user_keys)
    bench_keys = preprocess_keys(bench_keys)
    # print("user keys:", user_keys)
    # print("bench keys:", bench_keys)

    if len(user_keys) > 0 and any(key in user_keys for key in bench_keys):
        # print("similarity score:", simScore)
        importance_with_ents = importance_of_keywords_with_entities(
            bench_ans, user_keys)
        importance_of_all_words = importance_of_keywords_with_entities(
            bench_ans, bench_keys)

        # Calculate Normalized_Sum_of_Keyword_Importances
        user_keyword_importances = list(importance_with_ents.values())
        bench_keywords_importances = list(importance_of_all_words.values())
        # print(user_keyword_importances)
        # print(bench_keywords_importances)
        all_keyword_importances = list()
        all_keyword_importances = [
            *user_keyword_importances, *bench_keywords_importances]

        all_keyword_importances = list(set(all_keyword_importances))
        # print(all_keyword_importances)
        # print("User keyword importances:", user_keyword_importances)
        # print("All keyword importances:", all_keyword_importances)

        max_importance = max(all_keyword_importances)
        min_importance = 0
        range_importance = max_importance - min_importance
        normalized_sum_of_correct_keyword_importances = 0
        normalized_sum_of_all_keyword_importances = 0

        if range_importance == 0:
            normalized_score = 0
        else:
            # normalized_sum_of_keyword_importances = sum(importance_with_ents.values())

            # Calculate normalized correct keywords mention by user in answer
            normalized_correct_keyword_importances = [
                value / max_importance for value in user_keyword_importances]
            normalized_sum_of_correct_keyword_importances = sum(
                normalized_correct_keyword_importances)

            # Calculate normalized sum of all keywords in benchmark answer
            normalized_all_keyword_importances = [
                value / max_importance for value in all_keyword_importances]
            normalized_sum_of_all_keyword_importances = sum(
                normalized_all_keyword_importances)

            normalized_score = normalized_sum_of_correct_keyword_importances / \
                normalized_sum_of_all_keyword_importances

        # Calculate Correct_Keyword_Count
        correct_keyword_count = len(set(user_keys) & set(bench_keys))

        # print("correct keyword count:", correct_keyword_count)
        # print("normalized score:", normalized_score)
        # Final score calculation based on the weights
        final_score = (0.7 * normalized_score) + (0.3 * simScore)
        # print("Final score:",final_score)

    else:
        # print(simScore)
        final_score = 0.8 * simScore

    return final_score

# user_ans = sys.argv[1]
# bench_ans = sys.argv[2]
# bench_keys = sys.argv[3]

if __name__ == "__main__":
    user_ans = sys.argv[1]
    bench_ans = sys.argv[2]
    bench_keys = sys.argv[3]
    print(finalScore(user_ans, bench_ans, bench_keys))

# print(json.dumps(finalScore('Enthusiasm of the merchants and Industrialists faded away during the later stage of CDM due to following reasons: (i) The industrialists attacked the colonial control over the Indian economy and supported the Civil Disobedience Movement when it was first launched. (ii) After the failure of Round Table Conference, business groups were no longer uniformly enthusiastic.' 
#                  ,'Enthusiasm of the merchants and Industrialists faded away during the later stage of CDM due to following reasons: (i) The industrialists attacked the colonial control over the Indian economy and supported the Civil Disobedience Movement when it was first launched. (ii) They gave financial assistance and refused to buy or sell imported goods. (iii) Most businessmen came to see Swaraj as a time when colonial restrictions on business would no longer exist and trade and industry would flourish without constraints. (iv) But after the failure of Round Table Conference, business groups were no longer uniformly enthusiastic. (v) They were apprehensive of the spread of militant activities, and worried about prolonged disruption of business, as well as of the growing influence of socialism amongst the younger members of the congress.', 
#                  ['cdm', 'industrialists', 'civil disobedience movement', 'round table conference'])))

# print(similarityScore('Enthusiasm of the merchants and Industrialists faded away during the later stage of CDM due to following reasons: (i) The industrialists attacked the colonial control over the Indian economy and supported the Civil Disobedience Movement when it was first launched. (ii) After the failure of Round Table Conference, business groups were no longer uniformly enthusiastic.' ,'Enthusiasm of the merchants and Industrialists faded away during the later stage of CDM due to following reasons: (i) The industrialists attacked the colonial control over the Indian economy and supported the Civil Disobedience Movement when it was first launched. (ii) They gave financial assistance and refused to buy or sell imported goods. (iii) Most businessmen came to see Swaraj as a time when colonial restrictions on business would no longer exist and trade and industry would flourish without constraints. (iv) But after the failure of Round Table Conference, business groups were no longer uniformly enthusiastic. (v) They were apprehensive of the spread of militant activities, and worried about prolonged disruption of business, as well as of the growing influence of socialism amongst the younger members of the congress.'))
# print(keywordGenerator('Enthusiasm of the merchants and Industrialists faded away during the later stage of CDM due to following reasons: (i) The industrialists attacked the colonial control over the Indian economy and supported the Civil Disobedience Movement when it was rst launched. (ii) They gave financial assistance and refused to buy or sell imported goods. (iii) Most businessmen came to see Swaraj as a time when colonial restrictions on business would no longer exist and trade and industry would ourish without constraints. (iv) But after the failure of Round Table Conference, business groups were no longer uniformly enthusiastic. (v) They were apprehensive of the spread of militant activities, and worried about prolonged disruption of business, as well as of the growing inuence of socialism amongst the younger members of the congress.'))
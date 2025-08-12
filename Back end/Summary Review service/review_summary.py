import mysql.connector
from transformers import pipeline
from flask import Flask, jsonify, request

# Database configuration
config = {
    'user': 'root',
    'port': 3306,# Replace with your MySQL username
    'password': '23112014Dat*',  # Replace with your MySQL password
    'host': 'localhost',  # Replace with your MySQL host (e.g., 'localhost')
    'database': 'test_accomodation'  # Replace with your database name
}

# Initialize NLP pipelines
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Flask app setup
app = Flask(__name__)

def fetch_reviews(accommodation_id):
    """Fetch reviews from the database for a given accommodation_id."""
    try:
        cnx = mysql.connector.connect(**config)
        cursor = cnx.cursor()
        query = "SELECT comment FROM Review WHERE accommodation_id = %s AND comment IS NOT NULL"
        cursor.execute(query, (accommodation_id,))
        reviews = [row[0] for row in cursor.fetchall() if row[0].strip()]
        cursor.close()
        cnx.close()
        return reviews
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return []

def analyze_sentiment(reviews):
    """Analyze sentiment of each review."""
    sentiments = []
    for review in reviews:
        try:
            result = sentiment_analyzer(review)[0]
            sentiments.append(result['label'])
        except Exception as e:
            print(f"Error analyzing sentiment for review: {review[:50]}... {e}")
            sentiments.append('NEUTRAL')  # Fallback for errors
    return sentiments

def segregate_reviews(reviews, sentiments):
    """Segregate reviews into positive and negative based on sentiment."""
    positive_reviews = [r for r, s in zip(reviews, sentiments) if s == 'POSITIVE']
    negative_reviews = [r for r, s in zip(reviews, sentiments) if s == 'NEGATIVE']
    return positive_reviews, negative_reviews

def summarize_reviews(review_list, max_input_length=1024):
    """Summarize a list of reviews."""
    if not review_list:
        return "No reviews available."
    text = " ".join(review_list)
    if len(text) > max_input_length:
        text = text[:max_input_length]
    try:
        summary = summarizer(text, max_length=150, min_length=30, do_sample=False)[0]['summary_text']
        return summary
    except Exception as e:
        print(f"Error summarizing reviews: {e}")
        return "Summary unavailable due to processing error."

@app.route('/summarize/<int:accommodation_id>', methods=['GET'])
def summarize_reviews_endpoint(accommodation_id):
    """API endpoint to summarize reviews for an accommodation."""
    # Fetch reviews
    reviews = fetch_reviews(accommodation_id)
    if not reviews:
        return jsonify({"error": "No valid reviews found for accommodation ID " + str(accommodation_id)}), 404

    # Analyze sentiment
    sentiments = analyze_sentiment(reviews)

    # Segregate reviews
    positive_reviews, negative_reviews = segregate_reviews(reviews, sentiments)

    # Summarize reviews
    positive_summary = summarize_reviews(positive_reviews)
    negative_summary = summarize_reviews(negative_reviews)

    # Calculate sentiment distribution
    total_reviews = len(reviews)
    positive_count = sentiments.count('POSITIVE')
    negative_count = sentiments.count('NEGATIVE')
    positive_percentage = round((positive_count / total_reviews) * 100, 2) if total_reviews > 0 else 0
    negative_percentage = round((negative_count / total_reviews) * 100, 2) if total_reviews > 0 else 0

    # Return results
    response = {
        'accommodation_id': accommodation_id,
        'total_reviews': total_reviews,
        'positive_percentage': positive_percentage,
        'negative_percentage': negative_percentage,
        'positive_summary': positive_summary,
        'negative_summary': negative_summary
    }
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)
from flask import Flask, request, jsonify
import tensorflow as tf
import pandas as pd
import numpy as np
import joblib
import json
from sqlalchemy import create_engine
import logging
import os
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity


os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
tf.get_logger().setLevel('ERROR')


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)


db_url = "mysql+pymysql://root:23112014Dat*@localhost:3306/test_accomodation"
engine = create_engine(db_url)

# Load model and preprocessing objects
try:
    model = tf.keras.models.load_model('./model_data/enhanced_ncf_model_v5_ohe.keras')
    logger.info("Loaded enhanced_ncf_model_v5_ohe.keras successfully")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    raise

try:
    item_features = pd.read_csv('./model_data/item_features_ohe.csv').set_index('accommodation_id')
    user_features = pd.read_csv('./model_data/user_features_encoded_ohe.csv').set_index('user_id')
    interactions_df = pd.read_csv('./model_data/interactions.csv')
    logger.info("Loaded item_features_ohe.csv, user_features_encoded_ohe.csv, and interactions.csv")
except FileNotFoundError as e:
    logger.error(f"Feature file not found: {e}")
    raise
except Exception as e:
    logger.error(f"Error loading feature files: {e}")
    raise

try:
    with open('./model_data/item_feature_cols_ohe.json', 'r', encoding='utf-8') as f:
        item_feature_cols = json.load(f)
    with open('./model_data/user_feature_cols_ohe.json', 'r', encoding='utf-8') as f:
        user_feature_cols = json.load(f)
    item_scaler = joblib.load('./model_data/item_scaler_ohe.joblib')
    user_scaler = joblib.load('./model_data/user_scaler_ohe.joblib')
    item_mlb_amenities = joblib.load('./model_data/item_mlb_amenities_ohe.joblib')
    top_amenities_set = joblib.load('./model_data/top_amenities_set_ohe.joblib')
    logger.info("Loaded feature columns and preprocessing objects")
except FileNotFoundError as e:
    logger.error(f"Preprocessing file not found: {e}")
    raise
except Exception as e:
    logger.error(f"Error loading preprocessing files: {e}")
    raise

def preprocess_item_features(item_data):

    df = pd.DataFrame(item_data)

    # Numerical features
    df['log_price'] = np.log1p(df['price_per_night'])
    df['rating_cleaned'] = df['average_rating'].fillna(3.5).clip(lower=1.0, upper=5.0)
    df['log_distance'] = np.log1p(df.get('distance_to_center', 10.0))
    numerical_cols = item_feature_cols['numerical']
    numerical_data = df[numerical_cols].replace([np.inf, -np.inf], np.nan).fillna(0)
    numerical_scaled = item_scaler.transform(numerical_data)

    # Categorical features (one-hot encoded)
    df['location_parsed'] = df['location_city'].fillna('Hà Nội')
    df['type'] = df['type'].fillna('HOTEL')
    location_ohe = pd.get_dummies(df['location_parsed'], prefix='loc', dtype=np.float32)
    type_ohe = pd.get_dummies(df['type'], prefix='type', dtype=np.float32)
    categorical_cols = item_feature_cols['categorical_onehot']
    categorical_data = pd.concat([location_ohe, type_ohe], axis=1).reindex(columns=categorical_cols, fill_value=0.0)

    # Sparse features (amenities)
    amenities = df['amenities'].apply(lambda x: [a for a in x if a in top_amenities_set] if isinstance(x, list) else [])
    amenities_encoded = item_mlb_amenities.transform(amenities)
    sparse_cols = item_feature_cols['sparse']
    sparse_data = pd.DataFrame(amenities_encoded, columns=sparse_cols, dtype=np.float32)

    # Combine all features
    all_features = pd.concat([
        pd.DataFrame(numerical_scaled, columns=numerical_cols, index=df.index),
        categorical_data,
        sparse_data
    ], axis=1)
    all_dense_cols = item_feature_cols['all_dense']
    return all_features[all_dense_cols].values.astype(np.float32)

def preprocess_user_features(user_data):

    # Extract user features
    budget = float(user_data.get('budget_pref', 100000))
    travel_frequency = float(user_data.get('travel_frequency_score', 1.0))
    location_pref = user_data.get('location_pref_str', 'Hà Nội')
    type_pref = user_data.get('property_type_pref_str', 'HOTEL')
    amenity_prefs = user_data.get('amenities_pref', [])

    # Numerical features
    numerical_data = pd.DataFrame([[budget, travel_frequency]], columns=['budget_pref', 'travel_frequency_score'])
    numerical_scaled = user_scaler.transform(numerical_data)

    # Categorical features (one-hot encoded)
    location_ohe = pd.get_dummies(pd.Series([location_pref]), prefix='loc', dtype=np.float32)
    type_ohe = pd.get_dummies(pd.Series([type_pref]), prefix='type', dtype=np.float32)
    categorical_cols = user_feature_cols['categorical_onehot']
    categorical_data = pd.concat([location_ohe, type_ohe], axis=1).reindex(columns=categorical_cols, fill_value=0.0)

    # Sparse features (amenities)
    amenity_prefs = [a for a in amenity_prefs if a in top_amenities_set]
    amenities_encoded = item_mlb_amenities.transform([amenity_prefs])
    sparse_cols = user_feature_cols['sparse']
    sparse_data = pd.DataFrame(amenities_encoded, columns=[f"amenity_{cls}" for cls in item_mlb_amenities.classes_], dtype=np.float32)
    sparse_data = sparse_data.reindex(columns=sparse_cols, fill_value=0.0)

    # Combine all features
    all_features = pd.concat([
        pd.DataFrame(numerical_scaled, columns=['budget_pref', 'travel_frequency_score'], index=[0]),
        categorical_data,
        sparse_data
    ], axis=1)
    all_dense_cols = user_feature_cols['all_dense']
    return all_features[all_dense_cols].values.astype(np.float32)

def encode_new_user_profile(new_user_profile_raw):

    # Extract inner user_features if present
    if 'user_features' in new_user_profile_raw and isinstance(new_user_profile_raw['user_features'], dict):
        new_user_profile_raw = new_user_profile_raw['user_features']
        logger.info(f"Extracted inner user_features: {new_user_profile_raw}")

    # Create DataFrame with input data
    new_user_df = pd.DataFrame([new_user_profile_raw])
    logger.info(f"New user profile columns: {new_user_df.columns.tolist()}")

    # Ensure numerical columns exist and are numeric
    user_numerical_cols = user_feature_cols.get('numerical', [])
    for col in user_numerical_cols:
        if col not in new_user_df.columns:
            logger.warning(f"Column {col} is not present in the new user profile, using default value 0.0")
            new_user_df[col] = 0.0  # Default value if missing
        new_user_df[col] = pd.to_numeric(new_user_df[col], errors='coerce').fillna(0.0)

    # Scale numerical features
    if user_numerical_cols:
        try:
            numerical_data = new_user_df[user_numerical_cols]
            new_user_df[user_numerical_cols] = user_scaler.transform(numerical_data)
        except Exception as e:
            logger.error(f"Error scaling numerical features: {e}")
            raise

    # Categorical One-Hot Features
    item_loc_cols = [col for col in item_feature_cols.get('categorical_onehot', []) if col.startswith('loc_')]
    item_type_cols = [col for col in item_feature_cols.get('categorical_onehot', []) if col.startswith('type_')]

    if 'location_pref_str' in new_user_df.columns and item_loc_cols:
        loc_ohe = pd.get_dummies(new_user_df['location_pref_str'], prefix='loc', dtype=np.float32)
        loc_ohe = loc_ohe.reindex(columns=item_loc_cols, fill_value=0.0)
        new_user_df = pd.concat([new_user_df.drop(columns=['location_pref_str']), loc_ohe], axis=1)

    if 'property_type_pref_str' in new_user_df.columns and item_type_cols:
        type_ohe = pd.get_dummies(new_user_df['property_type_pref_str'], prefix='type', dtype=np.float32)
        type_ohe = type_ohe.reindex(columns=item_type_cols, fill_value=0.0)
        new_user_df = pd.concat([new_user_df.drop(columns=['property_type_pref_str']), type_ohe], axis=1)

    # Sparse Features (Amenities)
    user_amenity_cols_target = user_feature_cols.get('sparse', [])
    if 'amenities_pref' in new_user_df.columns and user_amenity_cols_target:
        amenities_to_transform = new_user_df['amenities_pref'].apply(lambda x: x if isinstance(x, list) else [])
        amenities_sparse = item_mlb_amenities.transform(amenities_to_transform)
        amenities_df = pd.DataFrame(
            amenities_sparse,
            columns=[f"amenity_{cls}" for cls in item_mlb_amenities.classes_],
            index=new_user_df.index,
            dtype=np.float32
        )
        amenities_df = amenities_df.reindex(columns=user_amenity_cols_target, fill_value=0.0)
        new_user_df = pd.concat([new_user_df.drop(columns=['amenities_pref']), amenities_df], axis=1)

    # Ensure final columns match existing users' features
    all_user_dense_features = user_feature_cols.get('all_dense', [])
    if not all_user_dense_features:
        raise ValueError("User feature 'all_dense' list is empty in user_feature_cols_dict.")
    new_user_encoded_vector = new_user_df.reindex(columns=all_user_dense_features, fill_value=0.0)
    return new_user_encoded_vector.values

def recommend_for_new_user_by_feature_similarity(new_user_profile_raw, k_similar_users=30, top_n_recs=10):

    logger.info(f"New user raw profile: {new_user_profile_raw}")
    try:
        # Encode the new user's profile
        new_user_encoded_vector = encode_new_user_profile(new_user_profile_raw)
        if new_user_encoded_vector.shape[1] == 0:
            logger.error("New user encoded vector is empty.")
            return recommend_popular_items(top_n_recs)

        logger.info(f"New user encoded vector shape: {new_user_encoded_vector.shape}")

        # Calculate similarities to existing users
        existing_user_feature_matrix = user_features[user_feature_cols['all_dense']].values
        logger.info(f"Existing user feature matrix shape: {existing_user_feature_matrix.shape}")

        if new_user_encoded_vector.shape[1] != existing_user_feature_matrix.shape[1]:
            logger.error(
                f"Feature dimension mismatch! New user: {new_user_encoded_vector.shape[1]}, Existing users: {existing_user_feature_matrix.shape[1]}")
            return recommend_popular_items(top_n_recs)

        similarities = cosine_similarity(new_user_encoded_vector, existing_user_feature_matrix)
        similar_user_indices = np.argsort(similarities[0])[::-1][:k_similar_users]
        similar_user_ids = user_features.index[similar_user_indices].tolist()

        logger.info(f"Found {len(similar_user_ids)} similar users: {similar_user_ids[:5]}")

        if not similar_user_ids:
            logger.warning("No similar users found. Falling back to popular items.")
            return recommend_popular_items(top_n_recs)

        # Aggregate preferences of similar users
        relevant_interactions = interactions_df[
            (interactions_df['user_id'].isin(similar_user_ids)) &
            (interactions_df['label'] == 1) &
            (interactions_df['interaction_weight'] >= 0.5)
        ]

        if relevant_interactions.empty:
            logger.warning("Similar users have no relevant positive interactions. Falling back to popular items.")
            return recommend_popular_items(top_n_recs)

        # Score items based on sum of interaction weights
        item_scores = relevant_interactions.groupby('accommodation_id')['interaction_weight'].sum()
        top_item_ids = item_scores.sort_values(ascending=False).head(top_n_recs).index.tolist()

        if not top_item_ids:
            logger.warning("No items found from similar users' preferences. Falling back to popular items.")
            return recommend_popular_items(top_n_recs)

        # Fetch accommodation details
        recs_details = pd.read_sql("""
            SELECT a.accommodation_id, a.owner_id, a.name as title, a.price_per_night,
                   COALESCE(a.average_rating, 0.0) as average_rating, l.city as location_parsed
            FROM Accommodation a
            JOIN Location l ON a.location_id = l.location_id
            WHERE a.accommodation_id IN (%s)
        """ % ','.join(map(str, [id for id in top_item_ids])), engine)

        if recs_details.empty:
            logger.warning("No details found for recommended item IDs. Falling back to popular items.")
            return recommend_popular_items(top_n_recs)

        # Assign similarity_based_score, defaulting to 0.0 for missing scores
        recs_details['similarity_based_score'] = recs_details['accommodation_id'].map(item_scores).fillna(0.0)
        recs_details = recs_details.sort_values('similarity_based_score', ascending=False)

        # Log any remaining NaN values for debugging
        for col in ['average_rating', 'similarity_based_score', 'price_per_night']:
            if recs_details[col].isna().any():
                logger.warning(f"Found NaN in {col} for records: {recs_details[recs_details[col].isna()][['accommodation_id', col]].to_dict()}")

        # Replace any remaining NaN with null for JSON compatibility
        recs_details['average_rating'] = recs_details['average_rating'].where(recs_details['average_rating'].notna(), None)
        recs_details['similarity_based_score'] = recs_details['similarity_based_score'].where(recs_details['similarity_based_score'].notna(), None)
        recs_details['price_per_night'] = recs_details['price_per_night'].where(recs_details['price_per_night'].notna(), None)

        display_cols = ['accommodation_id', 'owner_id', 'title', 'location_parsed', 'price_per_night', 'average_rating', 'similarity_based_score']
        final_display_cols = [col for col in display_cols if col in recs_details.columns]

        logger.info(f"Generated {len(recs_details)} recommendations for new user based on feature similarity.")
        return recs_details[final_display_cols].to_dict(orient='records')

    except Exception as e:
        logger.error(f"Error generating recommendations for new user: {e}")
        return recommend_popular_items(top_n_recs)

def recommend_popular_items(top_n=10):

    logger.info("Falling back to popular item recommendations.")
    popular_items = pd.read_sql("""
        SELECT a.accommodation_id, a.owner_id, a.name as title, a.price_per_night, a.average_rating, l.city as location_parsed
        FROM Accommodation a
        JOIN Location l ON a.location_id = l.location_id
        ORDER BY a.average_rating DESC
        LIMIT %s
    """ % top_n, engine)
    popular_items['price_display'] = popular_items['price_per_night'].apply(
        lambda x: f"{x:,.0f} VND" if pd.notna(x) else 'N/A')
    display_cols = ['accommodation_id', 'owner_id', 'title', 'location_parsed', 'price_display', 'average_rating']
    return popular_items[display_cols].to_dict(orient='records')

@app.route('/recommend_new', methods=['POST'])
def recommend_new():
    try:
        data = request.json or {}
        user_features_data = data.get('user_features', {})
        top_n = data.get('top_n', request.args.get('limit', 10, type=int))
        logger.info(f"Processing new user recommendation request, top_n={top_n}")

        if not isinstance(user_features_data, dict) or not user_features_data:
            logger.error("Invalid or empty user_features provided")
            return jsonify({'error': 'Invalid or empty user_features'}), 400

        recommendations = recommend_for_new_user_by_feature_similarity(
            user_features_data, k_similar_users=30, top_n_recs=top_n
        )
        logger.info(f"Returning {len(recommendations)} recommendations for new user")
        response = jsonify(recommendations)
        response.headers['Content-Type'] = 'application/json'
        return response
    except Exception as e:
        logger.error(f"Error processing new user recommendation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        user_id = int(data['user_id'])
        top_n = data.get('top_n', 10)
        logger.info(f"Processing recommendation request for user {user_id}, top_n={top_n}")

        # Fetch all accommodations from database
        accommodations = pd.read_sql("""
                                     SELECT a.accommodation_id,
                                            a.name,
                                            a.price_per_night,
                                            a.type,
                                            a.average_rating,
                                            l.city                as location_city,
                                            GROUP_CONCAT(am.name) as amenities
                                     FROM Accommodation a
                                              JOIN Location l ON a.location_id = l.location_id
                                              LEFT JOIN Accommodation_Amenities aa ON a.accommodation_id = aa.accommodation_id
                                              LEFT JOIN Amenities am ON aa.amenity_id = am.amenity_id
                                     GROUP BY a.accommodation_id
                                     """, engine)
        accommodations['amenities'] = accommodations['amenities'].apply(lambda x: x.split(',') if pd.notna(x) else [])

        all_item_ids = accommodations['accommodation_id'].values
        user_features_data = data.get('user_features', {})

        # Preprocess features
        item_features_proc = preprocess_item_features(accommodations.to_dict('records'))
        user_features_proc = preprocess_user_features(user_features_data)

        # Prepare model inputs
        user_ids = np.full(len(all_item_ids), user_id - 1, dtype=np.int32)
        model_inputs = {
            'user_id_input': user_ids,
            'item_id_input': all_item_ids - 1,
            'item_feature_input': item_features_proc,
            'user_feature_input': np.tile(user_features_proc, (len(all_item_ids), 1))
        }

        predictions = model.predict(model_inputs, batch_size=1024, verbose=0)
        scores = dict(zip(all_item_ids, predictions.flatten()))
        top_items = sorted(scores, key=scores.get, reverse=True)[:top_n]
        logger.info(f"Generated top {len(top_items)} recommendations for user {user_id}")

        result = accommodations[accommodations['accommodation_id'].isin(top_items)][
            ['accommodation_id', 'name', 'price_per_night', 'type', 'average_rating']
        ]
        result['predicted_score'] = result['accommodation_id'].map(scores)
        result = result.sort_values('predicted_score', ascending=False)

        logger.info(f"Returning {len(result)} recommendations")
        return jsonify(result.to_dict(orient='records'))

    except Exception as e:
        logger.error(f"Error processing recommendation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        user_id = int(data['user_id']) - 1
        item_ids = [int(id) - 1 for id in data['item_ids']]
        item_features_data = data.get('item_features', [])
        user_features_data = data.get('user_features', {})
        logger.info(f"Processing prediction request for user {user_id + 1}, {len(item_ids)} item IDs")

        # Validate inputs
        if user_id not in user_features.index and not user_features_data:
            logger.warning(f"User {user_id + 1} not found in user features and no user features provided")
            return jsonify({'error': 'User not found'}), 404

        valid_item_ids = [id for id in item_ids if
                          id in item_features.index or any(d['accommodation_id'] - 1 == id for d in item_features_data)]
        missing_item_ids = list(set(item_ids) - set(valid_item_ids))
        if not valid_item_ids:
            logger.warning("No valid item IDs provided")
            return jsonify({'error': 'No valid item IDs'}), 400

        if len(valid_item_ids) < len(item_ids):
            logger.warning(f"Some item IDs not found: {[id + 1 for id in missing_item_ids]}")

        # Fetch item features from database if not provided
        if not item_features_data:
            valid_item_ids_db = [id + 1 for id in valid_item_ids]
            item_features_data = pd.read_sql("""
                SELECT a.accommodation_id, a.price_per_night, a.type, a.average_rating,
                       l.city as location_city, GROUP_CONCAT(am.name) as amenities
                FROM Accommodation a
                JOIN Location l ON a.location_id = l.location_id
                LEFT JOIN Accommodation_Amenities aa ON a.accommodation_id = aa.accommodation_id
                LEFT JOIN Amenities am ON aa.amenity_id = am.amenity_id
                WHERE a.accommodation_id IN (%s)
                GROUP BY a.accommodation_id
            """ % ','.join(map(str, valid_item_ids_db)), engine)
            item_features_data['amenities'] = item_features_data['amenities'].apply(
                lambda x: x.split(',') if pd.notna(x) else [])
            item_features_data = item_features_data.to_dict('records')

        # Adjust accommodation_id in item_features_data to 0-based
        for item in item_features_data:
            item['accommodation_id'] = item['accommodation_id'] - 1

        # Preprocess features
        item_features_proc = preprocess_item_features(item_features_data)
        user_features_proc = preprocess_user_features(user_features_data)

        # Prepare model inputs
        user_ids = np.full(len(valid_item_ids), user_id, dtype=np.int32)
        model_inputs = {
            'user_id_input': user_ids,
            'item_id_input': np.array(valid_item_ids, dtype=np.int32),
            'item_feature_input': item_features_proc,
            'user_feature_input': np.tile(user_features_proc, (len(valid_item_ids), 1))
        }

        predictions = model.predict(model_inputs, batch_size=1024, verbose=0)
        logger.info(f"Generated {len(predictions)} predictions")

        return jsonify({
            "predictions": predictions.flatten().tolist(),
            "valid_item_ids": [id + 1 for id in valid_item_ids],
            "missing_item_ids": [id + 1 for id in missing_item_ids]
        })

    except Exception as e:
        logger.error(f"Error processing prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask API on port 5000")
    app.run(port=5000)

from flask import Flask, request, render_template

from src.pipeline.predict_pipeline import CustomData, PredictPipeline

app = Flask(__name__)

application = app


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predictdata', methods=['GET', 'POST'])
def predict_datapoint():

    if request.method == 'GET':
        return render_template('home.html')

    else:
        try:
            gender = request.form.get('gender')
            ethnicity = request.form.get('ethnicity')

            parental_level_of_education = request.form.get(
                'parental_level_of_education'
            )

            lunch = request.form.get('lunch')

            test_preparation_course = request.form.get(
                'test_preparation_course'
            )

            reading_score = int(request.form.get('reading_score'))
            writing_score = int(request.form.get('writing_score'))

            # Validate categorical inputs
            valid_categories = {
                'gender': (
                    gender, ['male', 'female']
                ),
                'ethnicity': (
                    ethnicity,
                    ['group A', 'group B', 'group C', 'group D', 'group E']
                ),
                'parental education': (
                    parental_level_of_education,
                    [
                        "associate's degree",
                        "bachelor's degree",
                        "master's degree",
                        "high school",
                        "some high school",
                        "some college"
                    ]
                ),
                'lunch': (
                    lunch, ['standard', 'free/reduced']
                ),
                'test preparation': (
                    test_preparation_course, ['none', 'completed']
                )
            }

            for field, (value, allowed_values) in valid_categories.items():
                if value not in allowed_values:
                    raise ValueError(f"Invalid selection for {field}.")

            # Validate academic scores
            if not 0 <= reading_score <= 100:
                raise ValueError(
                    "Reading score must be between 0 and 100."
                )

            if not 0 <= writing_score <= 100:
                raise ValueError(
                    "Writing score must be between 0 and 100."
                )

            data = CustomData(
                gender=gender,
                race_ethnicity=ethnicity,
                parental_level_of_education=parental_level_of_education,
                lunch=lunch,
                test_preparation_course=test_preparation_course,
                reading_score=reading_score,
                writing_score=writing_score
            )

            pred_df = data.get_data_as_data_frame()

            predict_pipeline = PredictPipeline()

            results = predict_pipeline.predict(pred_df)

            return render_template(
                'home.html',
                results=float(results[0])
            )

        except (ValueError, TypeError) as e:

            return render_template(
                'home.html',
                error=str(e)
            ), 400

        except Exception:

            app.logger.exception("Prediction failed")

            return render_template(
                'home.html',
                error="Prediction failed. Please try again."
            ), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

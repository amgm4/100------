# app.py (Flaskアプリケーションの例)
from flask import Flask, render_template, jsonify, send_from_directory
import os
import random
from PIL import Image

app = Flask(__name__)

# 画像ファイルの保存ディレクトリ
UPLOAD_FOLDER = 'static/images'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    # 画像ファイルの一覧を取得してHTMLテンプレートに渡す
    image_files = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
    return render_template('index.html', image_files=image_files)

@app.route('/generate_random_images')
def generate_random_images():
    image_files = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
    
    if not image_files:
        return jsonify({"message": "No images available"}), 404

    num_to_select = min(8, len(image_files))
    selected_paths = random.sample(image_files, num_to_select)
    
    # 画像のURLを返す (リサイズはフロントエンドで行うか、サーバーサイドで一時的にリサイズ画像を生成して提供)
    selected_urls = [f'/static/images/{filename}' for filename in selected_paths]
    
    return jsonify({"selected_images": selected_urls})

@app.route('/static/images/<filename>')
def serve_image(filename):
    # 画像を直接提供する（ブラウザがアクセスするパス）
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    # 実際には本番環境ではWerkzeugの開発サーバーではなくGunicornなどのWSGIサーバーを使う
    app.run(debug=True) # 開発中はdebug=Trueで自動リロードなど有効
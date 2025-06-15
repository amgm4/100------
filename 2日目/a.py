import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import os
import random

class ImageOrganizerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("画像オーガナイザー")
        self.image_files = []
        self.selected_images = []

        self.setup_ui()
        self.load_images_from_directory()

    def setup_ui(self):
        # --- 上部の8つの表示枠 ---
        self.top_frames = []
        self.top_labels = []
        top_frame_container = tk.Frame(self.root)
        top_frame_container.pack(pady=10)

        for i in range(8):
            frame = tk.Frame(top_frame_container, width=100, height=100, relief="solid", borderwidth=1)
            frame.grid(row=0, column=i, padx=5, pady=5)
            frame.grid_propagate(False) # 親フレームが子ウィジェットのサイズに合わせるのを防ぐ
            self.top_frames.append(frame)

            label = tk.Label(frame)
            label.pack(expand=True)
            self.top_labels.append(label)

        # --- ランダム生成ボタン ---
        self.random_button = tk.Button(self.root, text="ランダム生成", command=self.generate_random_images)
        self.random_button.pack(pady=10)

        # --- 下部のすべての写真表示枠 ---
        self.all_images_frame = tk.Frame(self.root)
        self.all_images_frame.pack(pady=10, fill=tk.BOTH, expand=True)

        self.canvas = tk.Canvas(self.all_images_frame)
        self.scrollbar = tk.Scrollbar(self.all_images_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas)

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(
                scrollregion=self.canvas.bbox("all")
            )
        )

        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")

        self.all_image_labels = []

    def load_images_from_directory(self):
        # ここでは、実行ファイルと同じディレクトリの'images'フォルダから画像を読み込むと仮定します。
        # 実際には、ユーザーにディレクトリを選択させるダイアログを追加することもできます。
        image_dir = "images" # ここを画像が保存されているディレクトリに変更してください
        if not os.path.exists(image_dir):
            messagebox.showerror("エラー", f"'{image_dir}' ディレクトリが見つかりません。")
            return

        valid_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp')
        self.image_files = [
            os.path.join(image_dir, f)
            for f in os.listdir(image_dir)
            if f.lower().endswith(valid_extensions)
        ]
        
        if not self.image_files:
            messagebox.showinfo("情報", "画像ファイルが見つかりませんでした。")
            return

        self.display_all_images()

    def display_all_images(self):
        # 既存の画像をクリア
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        self.all_image_labels.clear()

        # 画像をグリッド形式で表示
        cols = 4 # 1行あたりの表示数
        for i, img_path in enumerate(self.image_files):
            try:
                img = Image.open(img_path)
                img.thumbnail((100, 100)) # サムネイルサイズにリサイズ
                photo = ImageTk.PhotoImage(img)

                label = tk.Label(self.scrollable_frame, image=photo)
                label.image = photo # 参照を保持
                label.grid(row=i // cols, column=i % cols, padx=5, pady=5)
                self.all_image_labels.append(label)
            except Exception as e:
                print(f"Error loading image {img_path}: {e}")

    def generate_random_images(self):
        if not self.image_files:
            messagebox.showinfo("情報", "表示する画像がありません。")
            return

        # 既存の選択画像をクリア
        for label in self.top_labels:
            label.config(image='')
            label.image = None
        self.selected_images.clear()

        # 重複しないようにランダムに8枚選択
        num_to_select = min(8, len(self.image_files))
        selected_paths = random.sample(self.image_files, num_to_select)

        for i, img_path in enumerate(selected_paths):
            try:
                img = Image.open(img_path)
                # 枠のサイズに画像をリサイズ
                # ここでは100x100の枠にフィットさせる
                img.thumbnail((90, 90)) # 少し小さめにして枠内に収まるように
                photo = ImageTk.PhotoImage(img)

                label = self.top_labels[i]
                label.config(image=photo)
                label.image = photo # 参照を保持
                self.selected_images.append(photo) # 全体の参照リストにも追加

            except Exception as e:
                print(f"Error displaying random image {img_path}: {e}")
                # エラーが発生した場合は、その枠を空にするか、エラー表示を出すなど

if __name__ == "__main__":
    root = tk.Tk()
    app = ImageOrganizerApp(root)
    root.mainloop()
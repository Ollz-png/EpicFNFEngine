import tkinter as tk
from tkinter import filedialog, messagebox, ttk, scrolledtext
import multiprocessing
import heapq
import ast
import os

class ChartSorterApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("🎵 Chart Sorter Deluxe 🎵")
        self.geometry("600x400")
        self.minsize(500, 350)
        self.configure(bg="#222222")
        self.style = ttk.Style(self)
        self.style.theme_use("clam")

        self.style.configure("TButton",
                             background="#444444",
                             foreground="white",
                             font=("Segoe UI", 11, "bold"),
                             padding=8)
        self.style.map("TButton",
                       background=[("active", "#555555")])

        self.style.configure("TLabel",
                             background="#222222",
                             foreground="white",
                             font=("Segoe UI", 12))

        self.style.configure("TProgressbar",
                             thickness=25)

        self.create_widgets()
        self.progress_queue = multiprocessing.Manager().Queue()
        self.total_notes = 0
        self.sorted_notes_count = 0
        self.after_id = None
        self.progress_per_worker = {}

    def create_widgets(self):
        self.label_title = ttk.Label(self, text="Drag & Drop your chart file or click below", font=("Segoe UI", 16, "bold"))
        self.label_title.pack(pady=(15, 10))

        self.drop_frame = tk.Frame(self, bg="#333333", relief="ridge", bd=2, height=120)
        self.drop_frame.pack(fill="x", padx=20)
        self.drop_frame.pack_propagate(False)

        self.drop_label = tk.Label(self.drop_frame, text="Drop chart file here", fg="#aaa", bg="#333333", font=("Segoe UI", 14, "italic"))
        self.drop_label.pack(expand=True)

        self.btn_select = ttk.Button(self, text="Select Chart File", command=self.select_file)
        self.btn_select.pack(pady=15)

        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(self, orient="horizontal", length=500, mode="determinate", variable=self.progress_var)
        self.progress_bar.pack(pady=5)

        self.progress_percent_label = ttk.Label(self, text="0%")
        self.progress_percent_label.pack()

        self.log_box = scrolledtext.ScrolledText(self, height=8, bg="#111111", fg="#0f0", font=("Consolas", 10), state="disabled")
        self.log_box.pack(fill="both", expand=True, padx=20, pady=15)

        self.setup_drag_and_drop()

    def setup_drag_and_drop(self):
        try:
            import tkinterdnd2
            self.dnd = tkinterdnd2.TkinterDnD.Tk()
            self.drop_frame.drop_target_register(tkinterdnd2.DND_FILES)
            self.drop_frame.dnd_bind('<<Drop>>', self.on_drop)
            self.log("Drag and drop enabled.")
        except ImportError:
            self.log("tkinterdnd2 not installed — drag and drop disabled.")

    def log(self, message):
        self.log_box.configure(state="normal")
        self.log_box.insert(tk.END, message + "\n")
        self.log_box.see(tk.END)
        self.log_box.configure(state="disabled")

    def on_drop(self, event):
        files = self.drop_frame.tk.splitlist(event.data)
        if files:
            self.log(f"File dropped: {files[0]}")
            self.start_sorting(files[0])

    def select_file(self):
        file_path = filedialog.askopenfilename(
            title="Select chart file (JSON-style TXT)",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if file_path:
            self.log(f"File selected: {file_path}")
            self.start_sorting(file_path)

    def start_sorting(self, file_path):
        self.btn_select.config(state="disabled")
        self.progress_var.set(0)
        self.progress_percent_label.config(text="0%")
        self.label_title.config(text=f"Sorting: {os.path.basename(file_path)}")
        self.log("Starting sorting process...")

        with open(file_path, 'r') as f:
            lines = f.readlines()
        self.total_notes = len(lines)
        self.progress_bar.config(maximum=self.total_notes)
        self.sorted_notes_count = 0
        self.progress_queue = multiprocessing.Manager().Queue()

        cpu_count = multiprocessing.cpu_count()
        chunk_size = self.total_notes // cpu_count + 1
        self.chunks = [lines[i:i + chunk_size] for i in range(0, self.total_notes, chunk_size)]

        self.pool = multiprocessing.Pool(cpu_count)
        self.results = []
        self.progress_per_worker = {}

        for worker_id, chunk in enumerate(self.chunks):
            self.progress_per_worker[worker_id] = 0
            self.results.append(
                self.pool.apply_async(sort_chunk_with_progress, args=(chunk, self.progress_queue, worker_id))
            )

        self.file_path = file_path
        self.check_progress()

    def check_progress(self):
        updated = False
        while not self.progress_queue.empty():
            worker_id, count = self.progress_queue.get()
            self.progress_per_worker[worker_id] = count
            updated = True

        if updated:
            total_done = sum(self.progress_per_worker.values())
            if total_done > self.total_notes:
                total_done = self.total_notes
            self.sorted_notes_count = total_done

            percent = int((self.sorted_notes_count / self.total_notes) * 100)
            self.progress_var.set(self.sorted_notes_count)
            self.progress_percent_label.config(text=f"{percent}%")
            self.log(f"Progress: {self.sorted_notes_count}/{self.total_notes} notes sorted")

        if all(r.ready() for r in self.results):
            self.pool.close()
            self.pool.join()
            sorted_chunks = [r.get() for r in self.results]
            merged = heapq.merge(*sorted_chunks, key=lambda note: (float(note[0]), note[1], note[2], note[3]))
            sorted_lines = [str(note) for note in merged]

            output_path = self.file_path.rsplit('.', 1)[0] + "_sorted.txt"
            with open(output_path, 'w') as out_file:
                for line in sorted_lines:
                    out_file.write(line + '\n')

            self.log(f"Sorting complete! Saved to: {output_path}")
            messagebox.showinfo("Done", f"Sorting complete!\nSaved to:\n{output_path}")

            self.btn_select.config(state="normal")
            self.progress_var.set(0)
            self.progress_percent_label.config(text="0%")
            self.label_title.config(text="Drag & Drop your chart file or click below")
        else:
            self.after(100, self.check_progress)

def parse_line(line):
    try:
        note = ast.literal_eval(line.strip())
        if len(note) < 4:
            return None
        return note
    except Exception:
        return None

def sort_chunk_with_progress(chunk, progress_queue, worker_id):
    parsed = []
    total = len(chunk)
    for i, line in enumerate(chunk):
        note = parse_line(line)
        if note is not None:
            parsed.append(note)
        if i % 10 == 0 or i == total - 1:
            progress_queue.put((worker_id, i + 1))
    return sorted(parsed, key=lambda note: (float(note[0]), note[1], note[2], note[3]))

if __name__ == "__main__":
    app = ChartSorterApp()
    app.mainloop()

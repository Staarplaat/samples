# import io
# import base64
import os
import re
import json
import time
import requests
import mysql.connector
# from flask import Flask
# import threading
import random

# app = Flask(__name__)

# ==== CONFIG ====
MYSQL_CONFIG = {
    'user': 'proverka',
    'password': 'T8ysziqex08fzYKDjMSY',
    'host': '192.168.0.6',
    'database': 'stablediffusionjobs',
    'raise_on_warnings': True
}

INIT_IMG_FOLDER = "D:/htdocs/sd/outputs/qe/in/"   # <-- входящие init картинки
SAVE_IMG_FOLDER = "D:/htdocs/sd/outputs/qe/out/"
SAVE_IMG_FOLDER_for_htdocs =   "outputs/qe/out/"
COMFYUI_SERVER = "http://rtx4:8000"   # ComfyUI API
WORKFLOW_PATH_IMAGE_EDIT = "comfyui_image_qwen_image_edit_apiprompt.json"
WORKFLOW_PATH_REMOVE_BACKGROUND = "comfyui_workflow_remove_background_apiprompt.json"
WORKFLOW_PATH_UPSCALER = "comfyui_workflow_supir_lightning_upscaler.json"
max_iters_timeout = 300
LLM_API_URL = "http://192.168.0.161:1234/v1/chat/completions"

NNEDIT_STANDART_DIMENSION = 1024*1024
NNEDIT_STANDART_DIMENSION_TRESHOLD = round(NNEDIT_STANDART_DIMENSION*0.6)

substrings_bg_rem_for_search = ["remove the background", "remove background", "make transparent", "transparent background", "background transparent"]
substrings_upscale_search = ["make sharper", "upscale image", "enlarge image", "redraw with high detailization", "more resolution", "add resolution", "increase resolution", "increase the resolution", "sharper quality"]
substrings_upscale_direct_command_search = ["resize 2000", "resize 2500", "resize 3000", "upscale 2000", "upscale 2500", "upscale 3000"]

# =================


def has_cyrillic(text):
    return bool(re.search('[а-яА-Я]', text))

def llm_translate(texts_to_translate):
    
    prompt_text = f'''
    <glossaryPairs>
    "glossaryPairs": [
        {{
            "sourceText": "в оттенках серого",
            "translatedText": "grayscale"
        }},
        {{
            "sourceText": "оттенками серого",
            "translatedText": "grayscale"
        }},
        {{
            "sourceText": "оттенки серого",
            "translatedText": "grayscale"
        }},
        {{
            "sourceText": "четче",
            "translatedText": "sharper"
        }},
        {{
            "sourceText": "чётче",
            "translatedText": "sharper"
        }},
        {{
            "sourceText": "более четко",
            "translatedText": "sharper"
        }},
        {{
            "sourceText": "более четким",
            "translatedText": "sharper"
        }},
        {{
            "sourceText": "более четкой",
            "translatedText": "sharper"
        }},
        {{
            "sourceText": "более чётко",
            "translatedText": "sharper"
        }},
        {{
            "sourceText": "улучши качество",
            "translatedText": "make sharper and better brightness balance with better color"
        }}
    ]
    </glossaryPairs>
    <text_for_translate>{texts_to_translate}</text_for_translate> 
    <task>Using glossary pairs inside <glossaryPairs> tag, translate text inside <text_for_translate> to english. Если в исходном запросе содержится просьба написать что-то текстом, то оставь фразу для надписи как есть без перевода и напиши ее в кавычках.
    Answer only translated text.</task>
    /no_think
    '''
    
    # ,
    #     {{
    #         "sourceText": "в стиле",
    #         "translatedText": "by"
    #     }}
    content = [{"type": "text", "text": prompt_text}]
    system_prompt = "Using context answer user question. Answer only text anwser without any additional explanations."
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": content}
    ]

    payload = {
        #"model": self.model_name,
        "messages": messages,
        "max_tokens": 7000,
        "temperature": 0.2,
        "enable_thinking": False
    }

    response = requests.post(LLM_API_URL, json=payload)
    raw_content = response.json()['choices'][0]['message']['content']


    # Remove <think>...</think> including the tags
    cleaned_text = re.sub(r'<think>.*?</think>', '', raw_content, flags=re.DOTALL)
    # cleaned_text = re.sub(r'[^a-zA-Z0-9\s\-\.\,\!\?\;\:]', '', cleaned_text)
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text) #replace any newlines with simple space

    # Optionally, remove extra newlines or whitespace left behind
    cleaned_text = cleaned_text.strip()

    return cleaned_text
    
def get_pending_jobs():
    cnx = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = cnx.cursor(dictionary=True)
    query = ("SELECT status_for_edit_image.* FROM status_for_edit_image "
             "LEFT JOIN users ON users.id=status_for_edit_image.user_id "
             "WHERE status=0 AND users.banned=0 "
             "ORDER BY id ASC")
    cursor.execute(query)
    jobs = cursor.fetchall()
    cursor.close()
    cnx.close()
    return jobs

def update_job_status(job_id, status=1):
    cnx = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = cnx.cursor()
    cursor.execute("UPDATE status_for_edit_image SET status=%s WHERE id=%s", (status, job_id))
    cnx.commit()
    cursor.close()
    cnx.close()

def insert_result(user_id, status_id, output_type, imgpath, input_image, seed, params):
    cnx = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = cnx.cursor()
    cursor.execute(
        "INSERT INTO gotovo (created, user_id, status_id, type, output_image, input_image, seed, params) "
        "VALUES (NOW(), %s, %s, %s, %s, %s, %s, %s)",
        (user_id, status_id, output_type, imgpath, input_image, seed, params)
    )
    cnx.commit()
    inserted_id = cursor.lastrowid
    cursor.close()
    cnx.close()
    return inserted_id

def upload_image_to_comfy(filepath):
    """
    Загружаем картинку в ComfyUI через /upload/image
    """
    with open(filepath, "rb") as f:
        files = {"image": f}
        try:
            r = requests.post(f"{COMFYUI_SERVER}/upload/image", files=files)
            r.raise_for_status()
        except Exception as e:
            print(f"Ошибка upload_image_to_comfy: {e}")
            return None
    return os.path.basename(filepath)   # ComfyUI сохраняет под этим именем

def run_comfyui_job(params, initimg_file):
    """
    Подготовка workflow и запуск задачи в ComfyUI
    """
    client_id = str(time.time())
   
    # Извлечение ширины и высоты из initimgparams
    initimgparams = params.get("initimgparams", {})
    initimg_width = initimgparams.get("w", 0)
    initimg_height = initimgparams.get("h", 0)

    
    sharpenWithNNEditAllowed = True
    sharpenWithUpscalerAllowed = False
    if ((initimg_width*initimg_height) > NNEDIT_STANDART_DIMENSION_TRESHOLD ):
        sharpenWithNNEditAllowed = False
        sharpenWithUpscalerAllowed = True

    
   
    prompt = params.get("prompt", "")
    params['prompt_en'] = ""
    prompt_en = prompt
    if has_cyrillic(prompt):
        prompt_en = llm_translate(prompt)
        params['prompt_en'] = prompt_en

    print(f"prompt : {prompt}")
    print(f"prompt_en : {prompt_en}")
        
    job_type = "edit"
    if any(substring.lower() in prompt_en.lower() for substring in substrings_bg_rem_for_search):
        job_type = "removebg"
    elif any(substring.lower() in prompt_en.lower() for substring in substrings_upscale_search):
        if sharpenWithUpscalerAllowed:
            job_type = "upscale"
    elif any(substring.lower() in prompt_en.lower() for substring in substrings_upscale_direct_command_search):
        job_type = "upscale"
    
    print(f"job_type : {job_type}")
    
    
    if job_type == "removebg":
        with open(WORKFLOW_PATH_REMOVE_BACKGROUND, "r", encoding="utf-8") as f:
            workflow = json.load(f)
        workflow["1"]["inputs"]["image"] = initimg_file 
        
        # Отправляем workflow
        payload = {"prompt": workflow, "client_id": client_id}
        try:
            r = requests.post(f"{COMFYUI_SERVER}/prompt", json=payload)
            # print(f"r : {r}")
            # print(f"r.text : {r.text}")
            if r.status_code != 200:
                print("ComfyUI error:", r.status_code, r.text)
            else:
                res = json.loads(r.text)
            r.raise_for_status()
        except Exception as e:
            print(f"Ошибка при запросе к ComfyUI /prompt: {e}")
            return []

        # ждём результатов
        iteration = 0
        while iteration < max_iters_timeout:
            if res and 'prompt_id' in res:
                prompt_id = res['prompt_id']
                try:
                    h = requests.get(f"{COMFYUI_SERVER}/history/{prompt_id}")
                    if h.status_code == 200:
                        history = h.json()
                        if prompt_id in history:
                            if history[prompt_id]["status"]["completed"]:
                                outputs = history[prompt_id]["outputs"]
                                # print(f"outputs : {outputs}")
                                # print(outputs)
                                # SaveImage node id=60 - vanilla ONLY PNG saver, 105 (at least now) - custom "Save Image Plus" node with JPEG saver
                                # if "60" in outputs:  
                                #     return outputs["60"]["images"]
                                if "3" in outputs:  # SaveImage node id=60 - vanilla ONLY PNG saver, 105 (at least now) - custom "Save Image Plus" node with JPEG saver
                                    return outputs["3"]["images"]
                except Exception as e:
                    print(f"Ошибка при запросе history: {e}")
                    return []
            iteration += 1
            time.sleep(1)
            
    elif job_type == "upscale":

        sharpenWithUpscalerCurrentResolution = 2048
        if initimg_width > 1300 or initimg_height > 1300:
            sharpenWithUpscalerCurrentResolution = 2560
        if initimg_width > 1900 or initimg_height > 1900:
            sharpenWithUpscalerCurrentResolution = 3072

        upscale_to_size = sharpenWithUpscalerCurrentResolution
        if any(substring in prompt for substring in ["2000", "2048"]):
            upscale_to_size = 2048
        if any(substring in prompt for substring in ["2500", "2560"]):
            upscale_to_size = 2560
        if any(substring in prompt for substring in ["3000", "3072"]):
            upscale_to_size = 3072

        print(f"target resolution : {upscale_to_size}")
            
        with open(WORKFLOW_PATH_UPSCALER, "r", encoding="utf-8") as f:
            workflow = json.load(f)
        workflow["2"]["inputs"]["image"] = initimg_file 
        workflow["13"]["inputs"]["width"] = upscale_to_size 
        workflow["13"]["inputs"]["height"] = upscale_to_size 

        # Отправляем workflow
        payload = {"prompt": workflow, "client_id": client_id}
        try:
            r = requests.post(f"{COMFYUI_SERVER}/prompt", json=payload)
            # print(f"r : {r}")
            # print(f"r.text : {r.text}")
            if r.status_code != 200:
                print("ComfyUI error:", r.status_code, r.text)
            else:
                res = json.loads(r.text)
            r.raise_for_status()
        except Exception as e:
            print(f"Ошибка при запросе к ComfyUI /prompt: {e}")
            return []
    
        # ждём результатов
        iteration = 0
        while iteration < max_iters_timeout:
            if res and 'prompt_id' in res:
                prompt_id = res['prompt_id']
                try:
                    h = requests.get(f"{COMFYUI_SERVER}/history/{prompt_id}")
                    if h.status_code == 200:
                        history = h.json()
                        if prompt_id in history:
                            if history[prompt_id]["status"]["completed"]:
                                outputs = history[prompt_id]["outputs"]
                                # print(f"outputs : {outputs}")
                                # print(outputs)
                                # SaveImage node id=60 - vanilla ONLY PNG saver, 105 (at least now) - custom "Save Image Plus" node with JPEG saver
                                # if "60" in outputs:  
                                #     return outputs["60"]["images"]
                                if "24" in outputs:  # SaveImage node id=60 - vanilla ONLY PNG saver, 105 (at least now) - custom "Save Image Plus" node with JPEG saver
                                    return outputs["24"]["images"]
                except Exception as e:
                    print(f"Ошибка при запросе history: {e}")
                    return []
            iteration += 1
            time.sleep(1)
        
    else:
        # загружаем workflow-шаблон
        with open(WORKFLOW_PATH_IMAGE_EDIT, "r", encoding="utf-8") as f:
            workflow = json.load(f)

        # подменяем seed
        workflow["3"]["inputs"]["seed"] = random.randint(1,4294967294)
        # подменяем prompt
        # print(f"node[76][inputs][prompt] : {workflow["76"]["inputs"]["prompt"]}")
        
        workflow["76"]["inputs"]["prompt"] = prompt_en
        # подменяем init картинку в ноде LoadImage
        workflow["78"]["inputs"]["image"] = initimg_file  # имя файла в папке ComfyUI/input

        # Отправляем workflow
        payload = {"prompt": workflow, "client_id": client_id}
        try:
            r = requests.post(f"{COMFYUI_SERVER}/prompt", json=payload)
            # print(f"r : {r}")
            # print(f"r.text : {r.text}")
            if r.status_code != 200:
                print("ComfyUI error:", r.status_code, r.text)
            else:
                res = json.loads(r.text)
            r.raise_for_status()
        except Exception as e:
            print(f"Ошибка при запросе к ComfyUI /prompt: {e}")
            return []

        # ждём результатов
        iteration = 0
        while iteration < max_iters_timeout:
            if res and 'prompt_id' in res:
                prompt_id = res['prompt_id']
                try:
                    h = requests.get(f"{COMFYUI_SERVER}/history/{prompt_id}")
                    if h.status_code == 200:
                        history = h.json()
                        if prompt_id in history:
                            if history[prompt_id]["status"]["completed"]:
                                outputs = history[prompt_id]["outputs"]
                                # print(f"outputs : {outputs}")
                                # print(outputs)
                                # SaveImage node id=60 - vanilla ONLY PNG saver, 105 (at least now) - custom "Save Image Plus" node with JPEG saver
                                # if "60" in outputs:  
                                #     return outputs["60"]["images"]
                                if "105" in outputs:  # SaveImage node id=60 - vanilla ONLY PNG saver, 105 (at least now) - custom "Save Image Plus" node with JPEG saver
                                    return outputs["105"]["images"]
                except Exception as e:
                    print(f"Ошибка при запросе history: {e}")
                    return []
            iteration += 1
            time.sleep(1)
    

def save_image_from_comfy(image_data, job_id):
    """
    Скачиваем картинку из ComfyUI /view и сохраняем локально
    """
    imgname = f"job_{job_id}_{str(int(time.time() * 1000))}_{image_data['filename']}"
    outpath = os.path.join(SAVE_IMG_FOLDER, imgname)
    print(f"outpath : {outpath}")

    url = (f"{COMFYUI_SERVER}/view?"
           f"filename={image_data['filename']}"
           f"&subfolder={image_data['subfolder']}"
           f"&type={image_data['type']}")
    r = requests.get(url)
    r.raise_for_status()
    with open(outpath, "wb") as f:
        f.write(r.content)
        print("write img ok")

    return imgname

def get_comfyui_queue_size():
    """
    Получаем размер очереди задач на ComfyUI
    """
    r = requests.get(f"{COMFYUI_SERVER}/queue")
    
    # print(f"r.text : {r.text}")
    if r.status_code == 200:
        queue_info = r.json()
        # print(f"queue_info : {queue_info}")
        queue_running = 0
        queue_pending = 0
        if queue_info and "queue_running" in queue_info:
            queue_running = len(queue_info["queue_running"])
        if queue_info and "queue_pending" in queue_info:
            queue_pending = len(queue_info["queue_pending"])
        return queue_running + queue_pending
    else:
        print(f"Ошибка при получении размера очереди: {r.status_code}")
        return -1

def process_new_job():
    jobs = get_pending_jobs()
    for job in jobs:
        params = json.loads(job['params'])
        
        print(" ")
        print("Process new job")
        
        # получаем init картинку
        initimgs = json.loads(params.get("initimg", "[]"))
        if not initimgs:
            # update_job_status(job['id'], 0)
            continue

        initimg_file = initimgs[0]
        fullpath = os.path.join(INIT_IMG_FOLDER, initimg_file)
        # print(f"fullpath : {fullpath}")

        if not os.path.exists(fullpath):
            # results.append({"job_id": job['id'], "error": f"File not found {fullpath}"})
            print(f"job_id: {job['id']} error: File not found {fullpath}")
            continue

        # загружаем в ComfyUI
        uploaded_name = upload_image_to_comfy(fullpath)

        try:
            images = run_comfyui_job(params, uploaded_name)
            saved_paths = []
            for img in images:
                print(img)
                imgname = save_image_from_comfy(img, job['id'])
                path = SAVE_IMG_FOLDER_for_htdocs+imgname
                saved_paths.append(path)
                insert_result( job['user_id'], job['id'], 3, path, initimg_file, img.get("seed", 0), json.dumps(params, ensure_ascii=False) )
            update_job_status(job['id'], 1)
        except Exception as e:
            # update_job_status(job['id'], 0)
            print(f"Ошибка для job {job['id']}: {e}")


def check_and_add_jobs():
    """
    Проверка размера очереди и добавление задачи в ComfyUI, если размер очереди <= 10.
    """
    while True:
        queue_size = get_comfyui_queue_size()
        if queue_size >= 0 and queue_size <= 10:
            if queue_size > 0:
                print(f"Ок. Очередь: {queue_size}.")
            process_new_job()
        else:
            print(f"Очередь: {queue_size}, более 10, пока пропускаем добавление задачи в ComfyUI.")
        time.sleep(5)  # Проверка каждые 5 секунд


# @app.route("/process", methods=["GET"])

# def process_jobs():
#     check_thread = threading.Thread(target=check_and_add_jobs)
#     check_thread.daemon = True  # Поток будет завершён при завершении главного потока
#     check_thread.start()
#     return {"status": "started background job monitoring"}

if __name__ == "__main__":
    while True:
        check_and_add_jobs()
    # while True:
    #     try:
    #         check_and_add_jobs()
    #     except Exception as e:
    #         print("Ошибка в основном цикле:", e)
    #     time.sleep(5)

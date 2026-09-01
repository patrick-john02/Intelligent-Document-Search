import io
import os 
import uuid
import base64
from pypdf import PdfReader
from PIL import Image

from langchain_core.messages import HumanMessage
from core.configurations import vision_model

def extract_images_pdf(
    file_bytes: bytes,
    storage_dir: str="./documents/images"
)->list[dict]:
    
    os.makedirs(storage_dir, exist_ok=True)
    reader=PdfReader(io.BytesIO(file_bytes))
    extracted=[]
    
    for page_index, page in enumerate(reader.pages):
        for image_index, image_file in enumerate(page.images):
            image_ext = image_file.split(".")[-1] if "." in image_file.name else "png"
            unique_filename = f"{uuid.uuid4().hex[:10]}_p{page_index + 1}_{image_index}.{image_ext}"
            image_path = os.path.join(storage_dir, unique_filename)
            
            with open(image_path, "wb") as f:
                f.write(image_file.data)
                
            extracted.append({
                "page": page_index + 1,
                "image_bytes": image_file.data,
                "image_path": image_path,
                "image_name": image_file.name
            })
            
    return extracted

async def generate_image_caption(image_bytes: bytes)->str:
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    
    prompt=(
        "You are expert multimodel document intelligence system. Analyze this image from a document \n"
        "1. If it is a chart/graph: Detail the type (bar/line/pie/scatter plots/histogram), title, axes, labels, and exact data points.\n"
        "2. If it is a flowchart/architechture diagram: Detail all components, step-by-step workflow, and connections.\n"
        "3. If it contains text/forms: Transcribe all visible text accurately./n"
        "4. If it is a photo or illustration: Describe what it shows and its relevance.\n"
        "Provide a thorough, factual description"
    )
    
    message = HumanMessage(
        content=[
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"}}
        ]
    )
    
    
    
import logging
import os
from datetime import datetime

log_file=f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log"

log_path=os.path.join(os.getcwd(),"logs")  #current working directory
os.makedirs(log_path,exist_ok=True)   #make directory if not exists

log_file_path=os.path.join(log_path,log_file)

logging.basicConfig(level=logging.INFO,
         format='[%(asctime)s] %(lineno)d %(name)s - %(levelname)s - %(message)s')



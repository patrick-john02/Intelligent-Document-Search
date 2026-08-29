# from typing import List, Tuple, Dict, Any, Optional
# from markdown_it import MarkdownIt
# from bs4 import BeautifulSoup
# import re

# _md_parser = MarkdownIt("commonmark").enable("table")

# def parse_markdown_table(table_text:str)->Tuple[List[str]], List[list[str]]:
#     tokens = _md_parser.parse(table_text)
#     headers: List[str] = []
#     rows: List[List[str]] = []
#     current_row: List[str] = []
#     in_thead=False
#     in_tbody=False
    
    
#     for token in tokens: 
#         if token.type == "thead_open":
            
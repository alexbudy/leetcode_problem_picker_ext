from multiprocessing.connection import wait
import requests
from bs4 import BeautifulSoup
from requests_html import HTMLSession
import sys

''''Scraper for gathering all problems off leetcode landing page'''

db_problems_only = False
if len(sys.argv) > 1 and ('--db' in sys.argv[1:]):
  db_problems_only = True

base_url = "https://leetcode.com/problemset/"
if db_problems_only:
  base_url += 'database'
else:
  base_url += 'all'
base_url += '/?page={}'

# change as needed
f = open('db_probs.txt', 'a', encoding='utf-8')

for i in range(4,5):
  s = HTMLSession()
  url = base_url.format(i)
  print(url)
  response = s.get(url)
  response.html.render(wait = 4, sleep = 4)
  
  soup = BeautifulSoup(response.html.html, "html.parser")

  results = soup.find_all("div", class_="odd:bg-layer-1 even:bg-overlay-1 dark:odd:bg-dark-layer-bg dark:even:bg-dark-fill-4")

  for res in results:
    try:
      problem_link = res.find_all("a")[0]
      href = problem_link["href"]
      num, title = problem_link.text.strip().split('.')
      is_premium = len(res.find_all("svg", class_="text-brand-orange")) > 0
      acceptance = [span.text for span in res.find_all("span") if span.text.endswith('%')]
      difficulty = [span.text for span in res.find_all("span") if span.text in ['Easy', 'Medium', 'Hard']]
      print(num, title)
      print(num, file=f)
      # print(num, title, href, is_premium, acceptance[0], difficulty[0], file=f)
    except:
      # skips on first problem
      continue
  
f.close()
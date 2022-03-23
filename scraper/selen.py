from selenium import webdriver
import time
from bs4 import BeautifulSoup
import sys

# chromedriver.exe needs to be part of the PATH, or passed in as arg
driver = webdriver.Chrome()

outputFile = "non-premium.txt"
scrapePremiums = False
startWith = 1 # when continuing script
if len(sys.argv) > 1 and ('--premium' in sys.argv[1:]):
  '''Login and setup first for premium'''
  scrapePremiums = True

if len(sys.argv) > 1 and ('--start-with' in sys.argv[1:]):
  startWith = [int(n) for n in sys.argv[1:] if n.isnumeric()][0]
  
if scrapePremiums:
  outputFile = "premium.txt"
  
  # hit the login page
  url = "https://leetcode.com/accounts/login"
  driver.get(url)
  driver.find_element_by_id('id_login').send_keys('LEETCODE_USER')
  driver.find_element_by_id('id_password').send_keys('HIDDEN')
  driver.find_element_by_id('signin_btn').click()
  time.sleep(5)


f = open(outputFile, "a")

base_url = "https://leetcode.com{}"
with open('problem_list.csv') as fp:
  lines = fp.readlines()
  for line in lines:
    num, _, href, is_prem = line.split("  ")[:4]
    is_prem = [False, True][is_prem == "True"]
    if is_prem != scrapePremiums or (int(num) < startWith):
      continue

    url = base_url.format(href)
    print(url)

    driver.get(url)
    time.sleep(2)
    
    page_src = driver.page_source
    soup = BeautifulSoup(page_src, "html.parser")
    
    res = soup.find_all("div", class_="css-10o4wqw")[0]
    question_content = [p.text for p in soup.find_all("div", class_="question-content__JfgR")[0].find_all("p")]
    question_content = [content for content in question_content \
        if not any(['Example ' in content, '\xa0' == content, 'Constraints:' in content])]
    
    
    likes = [int(span.text) for span in res.find_all("span") if span.text.isnumeric()]
    uplikes, downlikes = likes
    desc_length = len(''.join(question_content))
    print(uplikes, downlikes, desc_length)
    print(num, uplikes, downlikes, desc_length, file=f)

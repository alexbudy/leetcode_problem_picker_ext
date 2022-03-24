import csv

probs = {}

with open('db_probs.txt') as f:
  db_probs = set([int(n.strip()) for n in f])

with open('premium.txt') as premiums, open('non-premium.txt') as non_prems:
  lines = premiums.readlines() + non_prems.readlines()
  for line in lines:
    num, ul, dl, vs = [int(n) for n in line.split()]
    probs[num] = {'uplikes': ul, 'downlikes': dl, 'verbosity': vs,
                  'category': 'DB' if num in db_probs else 'ALG'} # can also be SH or CONCURRENCY

with open('problem_list.csv') as pl_orig, open('problem_list_complete.csv', 'w', newline='') as pl_full:
  reader = csv.DictReader(pl_orig)
  writer = csv.DictWriter(pl_full, fieldnames=['prob_num','title','href','paywall','acceptance_rate','difficulty','uplikes','downlikes','verbosity','category'])
  writer.writeheader()
  for row in reader:
    new_row = row | probs[int(row['prob_num'])]
    writer.writerow(new_row)
from pymongo import Connection
connection = Connection()
db = connection.dadegan
valencies = db.valencies

# first remove all valencies
valencies.remove()

file = open('valency.txt')
desc = True
for line in file:
	# don't add description lines
	if desc:
		if line.startswith('------'): desc = False
		continue

	row = [x if x != '-' else None for x in line.strip().split('\t')]
	if len(row) == 6:
		verb = {
			'past tense root': row[0],
			'present tense root': row[1],
			'prfix': row[2],
			'non-verbal element': row[3],
			'verbal preposition': row[4],
			'valency': row[5],
		}

		valencies.insert(verb)
	else:
		print 'error: non-sense line; ', row
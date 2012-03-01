# coding=utf8

from pymongo import Connection
connection = Connection()
db = connection.dadegan

# Valency DB
def parseValency(valency):
	valency = valency.decode('utf-8')

	# rempve signs
	valency = valency[1:-1]
	
	def parseMotammam(motammam):

		def parseDesc(desc):
			# desc = desc.decode('utf-8')
			result = {}
			
			# extract items
			result['items'] = desc.split('|')
			
			# extract options
			desc = desc.replace('+/-', '.')	
			for ch in ['.', '+', '-']:
				desc = desc.replace(ch, ch + ' ')
			
			for opt in desc.split(' '):
				if opt: result[opt[:-1]] = opt[-1]

			return result

		desc = None
		if motammam.find('[') > -1: 
			desc = parseDesc(motammam[motammam.find('[')+1 : motammam.find(']')])
			motammam = motammam[:motammam.find('[')]

		optional = False
		if motammam.find('(') > -1:
			optional = True
			motammam = motammam[motammam.find('(')+1 : motammam.find(')')]

		motammam = motammam.strip()
		result = {}
		if motammam == u'فا':
			result = {'type': 'fa'}
		elif motammam == u'Ø':
			result = {'type': 'fa', 'state': 'null'}
		elif motammam == u'مف':
			result = {'type': 'mf', 'ra': desc[u'را']}
		elif motammam == u'مفن':
			result = {'type': 'mfn', 'ra': desc[u'را']}
		elif motammam == u'مفح':
			result = {'type': 'mfh', 'prepositions': desc['items']}
		elif motammam == u'مفد':
			result = {'type': 'mfd'}
		elif motammam == u'بند':
			result = {'type': 'bnd', 'eltezam': desc[u'التزامی'], 'tatabogh': desc[u'مطابقت']}
		elif motammam == u'مس':
			result = {'type': 'ms'}
		elif motammam == u'مق':
			result = {'type': 'mg', 'kind': desc['items'][0]}
		elif motammam == u'تم':
			result = {'type': 'tm'}
		else:
			raise 'unkown motammam', motammam.encode('utf-8')

		if optional:
			result['optional'] = True

		return result

	result = []
	for motammam in valency.split(u'،'):
		result.append(parseMotammam(motammam))
	
	return result

def importValencies():
	valencies = db.valencies

	# first remove all valencies
	valencies.remove()

	file = open('valency.txt')
	l, desc = 0, True
	for line in file:
		l += 1

		# don't add description lines
		if desc:
			if line.startswith('------'): desc = False
			continue

		try:
			row = [x if x != '-' else None for x in line.strip().split('\t')]
			verb = {
				'past tense root': row[0],
				'present tense root': row[1],
				'prfix': row[2],
				'non-verbal element': row[3],
				'verbal preposition': row[4],
				'valency': parseValency(row[5]),
			}

			valencies.insert(verb)
		except:
			print 'line %d error: %s' % (l, line),

# Dependency DB
def makeTree(sentence):
	def getChilds(parent):
		words = []
		for word in sentence:
			if word[6] == parent:
				words.append(word)
		return words

	def makeNode(node):
		word = {
			'surface': node[1],
			'lemma': node[2],
			'POS': node[3],
			'POSdetail': node[4],
			'desc': node[5],
		}

		childs = getChilds(node[0])
		if childs:
			word['childs'] = {}
			for child in childs:
				key = child[7]
				while key in word['childs']: key += 'x'
				word['childs'][key] = makeNode(child)

		return word

	root = getChilds('0')[0]
	return makeNode(root)

def importDependencies():
	dependencies = db.dependencies

	# first remove all dependencies
	dependencies.remove()

	file = open('dependency.conll')
	l, sentence = 0, []
	for line in file:
		parts = line.decode('utf-8').split("\t")

		if len(parts) < 2:
			tree = makeTree(sentence)
			dependencies.insert(tree)
			
			l += 1
			sentence = []
		else:
			sentence.append(parts)

	print '%d sentences imported' % l

if __name__ == "__main__":
	importValencies()
	importDependencies()
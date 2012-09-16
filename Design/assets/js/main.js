var drawTree, flatten, translations, treeLevel;

$(function() {
  $.get('static/verbs.txt', function(data) {
    $('input[name=q]').typeahead({
      source: data.split('\n'),
      highlighter: function(item) {
        return item;
      }
    });
    return $('.typeahead.dropdown-menu').css({
      width: $('input[type=text]').outerWidth()
    });
  });
  return $('.example').hover(function() {
    return $(this).addClass('active');
  }, function() {
    return $(this).removeClass('active');
  }).click(function() {
    var example, id, tree;
    $('.tree').slideUp('normal', function() {
      return $(this).remove();
    });
    id = $(this).attr('rel');
    example = $(this);
    mixpanel.track('dadegan tree', {
      'sentence-id': id
    });
    if ($("#tree" + id).length) {
      return;
    }
    tree = $("<div id='tree" + id + "' class='tree loading'></div>");
    example.after(tree);
    tree.hide().height('50px').slideDown();
    return $.get('/sentence/' + id, function(data) {
      tree.removeClass('loading');
      drawTree(data, "#tree" + id);
      tree.find('svg').show();
      return tree.animate({
        height: tree.find('svg').height() + 20
      });
    });
  });
});

drawTree = function(data, element) {
  var arrows, edge, edges, elevel, from, height, labels, leafWidth, leafs, level, to, tree, width, x, y, _i, _len, _ref, _ref1;
  flatten(data);
  level = function(l) {
    return 12 * Math.round(Math.pow(l, 1.7));
  };
  leafWidth = 60;
  width = data.leafs.length * leafWidth;
  height = 50 + .75 * level(treeLevel(data));
  x = function(id) {
    return width - id * leafWidth - leafWidth / 2;
  };
  y = height - 10;
  _ref = data.edges;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    edge = _ref[_i];
    _ref1 = [Math.min(edge.from, edge.to), Math.max(edge.from, edge.to)], from = _ref1[0], to = _ref1[1];
    elevel = level(edge.level);
    edge.xleft = x(to);
    edge.xright = x(from);
    edge.xoff = 10 + elevel * .6;
    edge.xmid = (edge.xleft + edge.xright) / 2;
    edge.ybottom = y - 15;
    edge.ytop = edge.ybottom - elevel;
    edge.ymid = edge.ytop + (edge.ybottom - edge.ytop) * 0.25;
  }
  tree = d3.select(element).append('svg').attr('width', width).attr('height', height).style('display', 'none');
  leafs = tree.selectAll('.leaf').data(data.leafs).enter().append('text').attr('class', function(d) {
    return "leaf l" + d.id;
  }).text(function(d) {
    return d.word;
  }).attr('x', function(d) {
    return x(d.id);
  }).attr('y', y).on('mouseover', function(d) {
    return d3.selectAll(".l" + d.id).classed('active', 1);
  }).on('mouseout', function(d) {
    return d3.selectAll(".l" + d.id).classed('active', 0);
  });
  d3.select(element + " .leaf").classed('root', 1);
  edges = tree.selectAll('.edge').data(data.edges).enter().append('path').attr('class', function(d) {
    return "edge l" + d.from + " l" + d.to;
  }).attr('d', function(d) {
    return "M" + d.xleft + "," + d.ybottom + " C" + (d.xleft + d.xoff) + "," + d.ytop + " " + (d.xright - d.xoff) + "," + d.ytop + " " + d.xright + "," + d.ybottom;
  });
  arrows = tree.selectAll('.arrow').data(data.edges).enter().append('path').attr('class', function(d) {
    return "arrow l" + d.from + " l" + d.to;
  }).attr('d', d3.svg.symbol().type('triangle-up').size(5)).attr('transform', function(d) {
    return "translate(" + d.xmid + ", " + d.ymid + ") rotate(" + (d.from > d.to ? 90 : -90) + ")";
  });
  return labels = tree.selectAll('.tlabel').data(data.edges).enter().append('text').attr('class', function(d) {
    return "tlabel l" + d.from + " l" + d.to;
  }).text(function(d) {
    return d.label;
  }).attr('transform', function(d) {
    return "translate(" + d.xmid + ", " + (d.ymid - 5) + ")";
  });
};

flatten = function(data) {
  var root, traverse;
  data.leafs = [];
  data.edges = [];
  traverse = function(node) {
    var child, edge, _ref, _results;
    data.leafs.push({
      id: node['index'],
      word: node['surface'],
      pos: node['POSdetail']
    });
    _ref = node['childs'];
    _results = [];
    for (edge in _ref) {
      child = _ref[edge];
      data.edges.push({
        from: node['index'],
        to: child['index'],
        label: translations[edge]
      });
      _results.push(traverse(child));
    }
    return _results;
  };
  root = {
    POSdetail: "ROOT",
    index: 0,
    surface: "ریشه",
    childs: {
      'ROOT': data
    }
  };
  return traverse(root);
};

treeLevel = function(data) {
  var e, edge, fromto, maxLevel, maximum, _i, _j, _len, _len1, _ref, _ref1;
  fromto = function(edge) {
    return [Math.min(edge.from, edge.to), Math.max(edge.from, edge.to)];
  };
  maxLevel = function(edge) {
    var e, efrom, eto, from, max, to, _i, _len, _ref, _ref1, _ref2;
    max = 0;
    _ref = fromto(edge), from = _ref[0], to = _ref[1];
    _ref1 = data.edges;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      _ref2 = fromto(e), efrom = _ref2[0], eto = _ref2[1];
      if (efrom >= from && eto <= to && !(efrom === from && eto === to)) {
        if (e.level > max) {
          max = e.level;
        }
      }
    }
    return max;
  };
  maximum = 0;
  _ref = data.edges;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    e = _ref[_i];
    _ref1 = data.edges;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      edge = _ref1[_j];
      edge.level = maxLevel(edge) + 1;
      if (edge.level > maximum) {
        maximum = edge.level;
      }
    }
  }
  return maximum;
};

translations = {
  'NE': 'اسم‌یار',
  'PART': 'افزودۀ پرسشی فعل',
  'APP': 'بدل',
  'NCL': 'بند اسم',
  'AJUCL': 'بند افزودۀ فعل',
  'PARCL': 'بند فعل وصفی',
  'TAM': 'تمییز',
  'NPRT': 'جزء اسمی',
  'LVP': 'جزء همکرد',
  'NPP': 'حرف اضافه اسم',
  'VPRT': 'حرف اضافه فعلی',
  'COMPPP': 'حرف اضافۀ تفضیلی',
  'ROOT': 'ریشه جمله',
  'NPOSTMOD': 'صفت پسین اسم',
  'NPREMOD': 'صفت پیشین اسم',
  'PUNC': 'علائم نگارشی',
  'SBJ': 'فاعل',
  'NVE': 'فعل‌یار',
  'ENC': 'فعل‏یار پی‏بستی',
  'ADV': 'قید',
  'NADV': 'قید اسم',
  'PRD': 'گزاره',
  'ACL': 'متمم بندی صفت',
  'VCL': 'متمم بندی فعل',
  'AJPP': 'متمم حرف اضافه‌ای صفت',
  'ADVC': 'متمم قیدی فعل',
  'NEZ': 'متمم نشانۀ اضافه‌ای صفت',
  'PROG': 'مستمرساز',
  'MOS': 'مسند',
  'MOZ': 'مضافٌ‌الیه',
  'OBJ': 'مفعول',
  'VPP': 'مفعول حرف اضافه‌ای',
  'OBJ2': 'مفعول دوم',
  'MESU': 'ممیز',
  'AJCONJ': 'هم‌پایه صفت',
  'PCONJ': 'هم‌پایۀ حرف اضافه',
  'NCONJ': 'هم‏پایه اسم',
  'VCONJ': 'هم‏پایه فعل',
  'AVCONJ': 'هم‏پایه قید',
  'POSDEP': 'وابسته پسین',
  'PREDEP': 'وابسته پیشین',
  'APOSTMOD': 'وابستۀ پسین صفت',
  'APREMOD': 'وابستۀ پیشین صفت'
};
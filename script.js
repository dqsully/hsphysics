'use strict';
// Setup
q.setup({
  cacheTimeout: Infinity,
  cacheLength: 40
});

// Splines library
function cubicSplineInterpolation(p) {
	var row = 0;
	var solutionIndex = (p.length - 1) * 4;

	// initialize matrix
	var m = []; // rows
	for (var i = 0; i < (p.length - 1) * 4; i++) {
		// columns (rows + 1)
		m.push([]);
		for (var j = 0; j <= (p.length - 1) * 4; j++) {
			m[i].push(0); // fill with zeros
		}
	}

	// splines through p equations
	for (var functionNr = 0; functionNr < p.length-1; functionNr++, row += 2) {
		var p0 = p[functionNr], p1 = p[functionNr+1];
		m[row][functionNr*4+0] = Math.pow(p0.x, 3);
		m[row][functionNr*4+1] = Math.pow(p0.x, 2);
		m[row][functionNr*4+2] = Math.pow(p0.x, 1);
		m[row][functionNr*4+3] = 1;
		m[row][solutionIndex] = p0.y;
		m[row+1][(functionNr)*4+0] = Math.pow(p1.x, 3);
		m[row+1][(functionNr)*4+1] = Math.pow(p1.x, 2);
		m[row+1][(functionNr)*4+2] = Math.pow(p1.x, 1);
		m[row+1][(functionNr)*4+3] = 1;
		m[row+1][solutionIndex] = p1.y;
	}

	// first derivative
	for (var functionNr = 0; functionNr < p.length - 2; functionNr++, row++) {
		var p1 = p[functionNr+1];
		m[row][functionNr*4+0] = 3*Math.pow(p1.x, 2);
		m[row][functionNr*4+1] = 2*p1.x;
		m[row][functionNr*4+2] = 1;
		m[row][functionNr*4+4] = -3*Math.pow(p1.x, 2);
		m[row][functionNr*4+5] = -2*p1.x;
		m[row][functionNr*4+6] = -1;
	}

	// second derivative
	for (var functionNr = 0; functionNr < p.length - 2; functionNr++, row++) {
		var p1 = p[functionNr+1];
		m[row][functionNr*4+0] = 6*p1.x;
		m[row][functionNr*4+1] = 2;
		m[row][functionNr*4+4] = -6*p1.x;
		m[row][functionNr*4+5] = -2;
	}

	// boundary conditions

	// first and last spline quadratic
	//m[row++][0] = 1;
	//m[row++][solutionIndex-4+0] = 1;*/

	// Not-a-knot spline (needs to be adapted - currently second derivative, should be third)
	//m[row][0+0] = 6*p[1].x;
	//m[row][0+1] = 2;
	//m[row][0+4] = -6*p[1].x;
	//m[row++][0+5] = -2;
	//m[row][solutionIndex-8+0] = 6*p[p.length - 1].x;
	//m[row][solutionIndex-8+1] = 2;
	//m[row][solutionIndex-8+4] = -6*p[p.length - 1].x;
	//m[row++][solutionIndex-8+5] = -2;

	// natural spline
	m[row][0+0] = 6*p[0].x;
	m[row++][0+1] = 2;
	m[row][solutionIndex-4+0] = 6*p[p.length-1].x;
	m[row][solutionIndex-4+1] = 2;




	var coefficients = solveMatrix(m);

	var functions = [];
	for (var i = 0; i < coefficients.length; i += 4) {
		functions.push({
			a: coefficients[i],
			b: coefficients[i+1],
			c: coefficients[i+2],
			d: coefficients[i+3],
			range: { xmin: p[i/4].x, xmax: p[i/4+1].x }
		})
	}
	return functions;
}

function solveMatrix(mat) {
	var len = mat.length;
	for (var i = 0; i < len; i++) { // column
		for (var j = i+1; j < len; j++) {// row
			if (mat[i][i] == 0) { // check if cell is zero
				var k = i;
				// search for an element where this cell is not zero
				while (mat[k][i] == 0) k++;
				// swap rows
				var tmp = mat[k].slice();
				mat[k] = mat[i].slice();
				mat[i] = tmp.slice();
			}
			var fac = -mat[j][i]/mat[i][i];
			for(var k = i; k < len+1; k++) // elements in a row
			mat[j][k] += fac *mat[i][k];
		}
	}

	var solution = [];
	for (var i = len-1; i >= 0; i--) { // column
		solution.unshift(mat[i][len]/mat[i][i]);
		for (var k = i-1; k >= 0; k--) {
			mat[k][len] -= mat[k][i] * solution[0];
		}
	}

	return solution;
}

// Helping Functions
function sidelistWidth() {
  return qc('#sidelist .sidescroll-container > div:first-child').width;
}
var lscroll = 0, _lscrollMax, li = 0;
function scrollSidebar(useli) {
  var w = sidelistWidth(), side = qc('#sidelist .sidescroll-container'), cChild = side.childCount, i, po, no;

  // Setup scrolling variables
  if(useli) lscroll = w * li;
  lscroll = lscroll.bound(0, _lscrollMax);
  li = lscroll / w;

  // Do scroll effect
  for(i=0; i<cChild; i++) {
    po = +side.c(i).style('opacity'), no = Math.max(0, 1 - Math.abs(i*w - lscroll)/w).toFixed(3);

    if(po != no)
      side.c(i)
      .style('opacity', no);
  }
  qc('#sidelist .sidescroll-container')
    .style('transform', q.translateX(-lscroll));

  // Scroll sidelistindex
  qc('#sidelistindex .sidescroll-container')
    .style('transform', q.translateX(-lscroll / 3));

  // Choose active sidelistindex
  var ca = q('#sidelistindex .sidescroll-container > div.active'), ba = qc('#sidelistindex .sidescroll-container').c(Math.round(li));
  if(ba.em != ca.em) {
    ca
      .remClass('active');
    ba
      .addClass('active');
  }
}

// Return a created graph
function makeGraph(options) {
  var defaults = {
    title: undefined,
    'iv-title': undefined,
    'dv-title': undefined,
    'iv-labels': 'auto',
    'dv-labels': 'auto',
    'x-interval': 'auto',
    'y-interval': 'auto',
    'graph-style': 'line',
    grid: 'auto',
    'grid-color': '#b9b9b9',
    width: 300,
    height: 300,
    precision: 3,
    'font-size': 15,
    fitting: 'auto',
    'data-color': 'auto',
    'legend': 'none',
    'y-min': 'auto',
    'y-max': 'auto',
    'x-min': 'auto',
    'x-max': 'auto',
  };

  var tmp;

  // Fill in defaults
  var i, defaultKeys = defaults.getKeys();
  for(i = 0; i < defaultKeys.length; i++) {
    if(!(defaultKeys[i] in options))
      options[defaultKeys[i]] = defaults[defaultKeys[i]];
    else if(options[defaultKeys[i]] == undefined && defaults[defaultKeys[i]] != undefined)
      options[defaultKeys[i]] = defaults[defaultKeys[i]];
  }

  // Make sure there are data points to display, these have no defaults!
  if(!options.data || !(options.data instanceof Object))
    throw new Error("Graph has no valid data!");

  // Create graph element
  var graphEm = newq('div').classes('graph');

  // Create title element
  if(options.title)
    graphEm.a('span')
      .classes('graph-title').text(options.title);

  // Create iv title element
  if(options['iv-title'])
    graphEm.a('span')
      .classes('graph-iv-title').text(options['iv-title']);

  // Create dv title element
  if(options['dv-title'])
    graphEm.a('span')
      .classes('graph-dv-title').text(options['dv-title']);

  // Create graph content element and retrieve 2d drawing context
  var graph = graphEm.a('canvas').attr('width', options.width).attr('height', options.height).em.getContext('2d');

  var width = +options.width, height = +options.height;

  var xmDef, xMDef, ymDef, yMDef, xDef, yDef;

  var
    xspan, yspan,
    xint,
    yint,
    xcount, ycount;

  var gridPaddingX = () => 10;
  var gridPaddingY = () => 10;
  var gridStartX = () => maxTextWidth + 5;
  var gridStartY = () => 20           + 5;
  var gridEndX = () => width - 15;
  var gridEndY = () => height - 15;
  var gridSpaceX = () => gridEndX() - gridStartX() - gridPaddingX();
  var gridSpaceY = () => gridEndY() - gridStartY() - gridPaddingY();
  var gridIntX = (x) => maxTextWidth + 5 + gridPaddingX() + (width  - gridStartX() - gridPaddingX() - width + gridEndX()) / xcount * x;
  var gridIntY = (y) => 20           + 5 + gridPaddingY() + (height - gridStartY() - gridPaddingY() - height + gridEndY()) / ycount * y;

  // Try predefining window
  if(!Number.isNaN(tmp = parseFloat(options['y-max']))) {
    yMax = tmp;
    yMDef = true;
  }
  if(!Number.isNaN(tmp = parseFloat(options['y-min']))) {
    yMin = tmp;
    ymDef = true;
    if(yMDef)
      yDef = true;
  }
  if(!Number.isNaN(tmp = parseFloat(options['x-max']))) {
    xMax = tmp;
    xMDef = true;
  }
  if(!Number.isNaN(tmp = parseFloat(options['x-min']))) {
    xMin = tmp;
    xmDef = true;
    if(xMDef)
      xDef = true;
  }

  if(yDef) {
    yspan = yMax - yMin;
    yint = options['y-interval'] == 'auto' ? yspan / (options['dv-labels'] instanceof Array ? Math.max(options['dv-labels'].length - 1, yspan) : 10) : options['y-interval'];
    ycount = yspan / yint;
  }
  if(xDef) {
    xspan = xMax - xMin;
    xint = options['x-interval'] == 'auto' ? xspan / (options['iv-labels'] instanceof Array ? Math.max(options['iv-labels'].length - 1, xspan) : 10) : options['x-interval'];
    xcount = xspan / xint;
  }

  // Load graphs into an array
  var graphs = [];

  function parseGraph(datain) {
    var out = {
      x: {m: undefined, M: undefined},
      y: {m: undefined, M: undefined},
      data: []
    };

    if(datain instanceof Function) {
      if(!xmDef || !xMDef)
        throw new Error('Function is given as data, but no x range is set');

      var xt, yt;

      maxTextWidth = 0;

      for(i = 0; i < gridSpaceX(); i++) {
        xt = i / gridSpaceX() * (xMax - xMin) + xMin;
        yt = datain(xt);
        if(!Number.isNaN(yt)) {
          if(out.x.m == undefined || xt < out.x.m)
            out.x.m = xt;
          if(out.x.M == undefined || xt > out.x.M)
            out.x.M = xt;

          if(out.y.m == undefined || yt < out.y.m)
            out.y.m = yt;
          if(out.y.M == undefined || yt > out.y.M)
            out.y.M = yt;

          out.data.push({x: xt, y: yt});
        }
      }

      maxTextWidth = undefined;
    } else {
      var dataKeys = datain.getKeys(), xt, yt;

      for(i = 0; i < dataKeys.length; i++) {
        xt = (typeof(datain[dataKeys[i]]) != 'number' ? datain[dataKeys[i]].x : (parseFloat(dataKeys[dataKeys[i]]) + 1));
        if(!Number.isNaN(xt)) {
          yt = (typeof(datain[dataKeys[i]]) != 'number' ? datain[dataKeys[i]].y : parseFloat(datain[dataKeys[i]]));
          if(!Number.isNaN(yt)) {
            if(out.x.m == undefined || xt < out.x.m)
              out.x.m = xt;
            if(out.x.M == undefined || xt > out.x.M)
              out.x.M = xt;

            if(out.y.m == undefined || yt < out.y.m)
              out.y.m = yt;
            if(out.y.M == undefined || yt > out.y.M)
              out.y.M = yt;

            out.data.push({x: xt, y: yt});
          }
        }
      }
    }

    return out;
  }

  // Fill graphs array with data points by parsing
  if(options.data[0] instanceof Array || options.data[0] instanceof Function)
    for(j = 0; j < options.data.length; j++)
      graphs.push(parseGraph(options.data[j]));
  else
    graphs.push(parseGraph(options.data));

  // Fill graphs array with colors
  if(options['data-color'] instanceof Array) {
    for(i = 0; i < options['data-color'].length; i++) {
      if(i in graphs)
        graphs[i].color = options['data-color'][i];
    }
    if(i < graphs.length)
      for(; i < graphs.length; i++)
        graphs[i].color = 'auto';
  } else
    for(i = 0; i < graphs.length; i++)
      graphs[i].color = options['data-color'];

  // Determine graph fitting
  if(options['y-max'] == 'auto' && options['y-min'] == 'auto') {
    if(options.fitting == 'auto')
      for(i = 0; i < graphs.length; i++)
        graphs[i].y.M += (2/3 * (graphs[i].y.M - graphs[i].y.m));
    else if(!Number.isNaN(tmp = parseFloat(options.fitting)))
      for(i = 0; i < graphs.length; i++)
        graphs[i].y.M += ((1 / tmp - 1) * (graphs[i].y.M - graphs[i].y.m));
  }

  // Calculate global maximums and minimums
  var xMin, xMax, yMin, yMax;

  graphs.forEach((g) => {
    if((xMin == undefined || g.x.m < xMin) && !xmDef)
      xMin = g.x.m;
    if((xMax == undefined || g.x.M > xMax) && !xMDef)
      xMax = g.x.M;
    if((yMin == undefined || g.y.m < yMin) && !ymDef)
      yMin = g.y.m;
    if((yMax == undefined || g.y.M > yMax) && !yMDef)
      yMax = g.y.M;
  });

  if(!yDef) {
    yspan = yMax - yMin;
    yint = options['y-interval'] == 'auto' ? yspan / (options['dv-labels'] instanceof Array ? Math.max(options['dv-labels'].length - 1, yspan) : 10) : options['y-interval'];
    ycount = yspan / yint;
  }
  if(!xDef) {
    xspan = xMax - xMin;
    xint = options['x-interval'] == 'auto' ? xspan / (options['iv-labels'] instanceof Array ? Math.max(options['iv-labels'].length - 1, xspan) : 10) : options['x-interval'];
    xcount = xspan / xint;
  }

  var c = (y) => height - y;
  var maxTextWidth = 0, text, textWidth;

  // Draw the gridlines
  function drawGrid() {
    var doDrawGrid = ['auto'].includes(options.grid);

    graph.fillStyle = '#e1e3e2';


    graph.font = options['font-size'] + 'px Lato';

    if(options['dv-labels'] == 'auto' || options['dv-labels'] instanceof Array) {
      for(i = 0; i < Math.floor(ycount) + 1; i++) {
        if(options['dv-labels'] == 'auto')
          text = (yMin + yint * i).toPrecision(+options.precision || 3);
        else
          text = options['dv-labels'][i] || '';
        textWidth = graph.measureText(text).width;

        if(textWidth > maxTextWidth)
          maxTextWidth = textWidth;

        graph.fillText(text, 0, c(gridIntY(i) - 5));
      }
    }

    graph.textAlign = 'center';

    if(options['iv-labels'] == 'auto' || options['iv-labels'] instanceof Array) {
      for(i = 0; i < Math.floor(xcount) + 1; i++) {
        if(options['iv-labels'] == 'auto')
          text = (xMin + xint * i).toPrecision(+options.precision || 3);
        else
          text = options['iv-labels'][i] || '';

        graph.fillText(text, gridIntX(i), c(5));
      }
    }

    graph.lineWidth = 1;
    graph.strokeStyle = options['grid-color'];

    if(doDrawGrid) {
      for(i = 0; i < Math.floor(ycount) + 1; i++) {
        graph.beginPath();

        graph.moveTo(Math.round(gridStartX()) + 0.5, c(Math.round(gridIntY(i)) + 0.5));
        graph.lineTo(Math.round(gridEndX()) + 0.5, c(Math.round(gridIntY(i)) + 0.5));
        graph.stroke();

        graph.closePath();
      }

      for(i = 0; i < Math.floor(xcount) + 1; i++) {
        graph.beginPath();

        graph.moveTo(Math.round(gridIntX(i)) + 0.5, c(Math.round(gridStartY()) + 0.5));
        graph.lineTo(Math.round(gridIntX(i)) + 0.5, c(Math.round(gridEndY()) + 0.5));
        graph.stroke();

        graph.closePath();
      }
    } else {
      graph.beginPath();

      graph.moveTo(Math.round(gridStartX()) + 0.5, c(Math.round(gridIntY(0)) + 0.5));
      graph.lineTo(Math.round(gridEndX()) + 0.5, c(Math.round(gridIntY(0)) + 0.5));

      graph.moveTo(Math.round(gridIntX(0)) + 0.5, c(Math.round(gridStartY()) + 0.5));
      graph.lineTo(Math.round(gridIntX(0)) + 0.5, c(Math.round(gridEndY()) + 0.5));

      graph.stroke();

      graph.closePath();
    }
  }

  // Draw a graph
  function drawGraph(g) {

    graph.lineWidth = '2';
    graph.strokeStyle = g.color == 'auto' ? '#00b887' : g.color;

    if(options['graph-style'] == 'smooth') {
      var eqs = cubicSplineInterpolation(g.data);

      graph.beginPath();

      var first = true;
      for(i = 0, X = g.x.m; X <= g.x.M; X += (xspan) / gridSpaceX()) {
        if(X >= g.x.m && X <= g.x.M)
          graph[first ? 'moveTo' : 'lineTo'](
            (X - xMin) / xspan * gridSpaceX() + gridStartX() + gridPaddingX(),
            c((eqs[i].a * X**3 + eqs[i].b * X**2 + eqs[i].c * X + eqs[i].d - yMin) / (yspan) * gridSpaceY() + gridStartY() + gridPaddingY())
          );

        if(X >= g.data[i + 1].x)
          i++;

        first = false;
      }

      graph.stroke();

      graph.closePath();
    } else if(options['graph-style'] == 'line') {
      graph.beginPath();

      var first = true;
      for(i = 0; i < g.data.length; i++) {
        graph[first ? 'moveTo' : 'lineTo'](
          (g.data[i].x - xMin) / xspan * gridSpaceX() + gridStartX() + gridPaddingX(),
          c((g.data[i].y - yMin) / yspan * gridSpaceY() + gridStartY() + gridPaddingY())
        );

        first = false;
      }

      graph.stroke();

      graph.closePath();
    }
  }


  drawGrid();
  graphs.forEach(drawGraph);


  // Add legend
  if(options.legend != 'none' && options.legend instanceof Array) {
    var legend = graphEm.a('ul')
      .classes('graph-legend');

    for(i = 0; i < graphs.length; i++) {
      legend.a('li')
        .style('color', graphs[i].color == 'auto' ? '#00b887' : graphs[i].color)
        .text(options.legend[i]);
    }
  }


  return graphEm;
}

var CancelAnimation, cheight;

// Main Code Chain
q.onready(
  // Table of Contents Generation
  () => {
    var rJumpTo = q('.unit-header-anchor, .topic-header');
    for(var i=0; i<rJumpTo.length; i++) ((JumpTo) => {
      qc('#toc ul').a('li')
        .classes(JumpTo.hasClass('topic-header') ? 'topic' : 'unit', 'u')
        .text(JumpTo.hasClass('topic-header') ? JumpTo.fc.text() : JumpTo.nextSibling.fc.text())
        .on('click', () => {
          var ScrollY = window.scrollY, dScrollY = JumpTo.offsetTop - (JumpTo.hasClass('topic-header') ? cheight || q('.unit-header-container', {first: true}).height : 0) - ScrollY;
          if(CancelAnimation != null) CancelAnimation();
          CancelAnimation = q.bezierAnimation(
            (x) => window.scroll(0, Math.round(ScrollY + dScrollY*x)),
            500,
            {
              timingFunction: 'ease',
              onend: () => CancelAnimation = null
            }
          );
        });
    })(rJumpTo(i));
  }
)(
  // <info> processing
  () => {
    var info = {}, tmp, data;
    q('info, .unit-header-anchor')
      .foreach((em, i, key) => {
        // Unit jump to
        if(em.hasClass('unit-header-anchor')) {
          qc('#tbl ul, #exs ul').a('li')
            .classes('unit', 'u')
            .text(em.nextSibling.text())
            .on('click', () => {
              var ScrollY = window.scrollY, dScrollY = em.offsetTop - ScrollY;
              if(CancelAnimation != null) CancelAnimation();
              CancelAnimation = q.bezierAnimation(
                (x) => window.scroll(0, Math.round(ScrollY + dScrollY*x)),
                500,
                {
                  timingFunction: 'ease',
                  onend: () => CancelAnimation = null
                }
              );
            });
        } else {
          // Parsing
          em.text().split(';').foreach((it, itkey) => {
            tmp = it.split(':');
            if(tmp.length != 2) return;
            info[tmp[0].trim()] = tmp[1].trim();
          });

          // Interpreting
          data = {};

          if('name' in info)
            data.name = info.name;
          else
            data.name = q('h3', {searchIn: em.parent, first: true}).text();

          if('implements' in info) {
            tmp = info.implements.split(',');
            if(tmp.includes('table')) {
              qc('#tbl ul').a('li')
                .classes('topic', 'u')
                .text(data.name)
                .on('click', () => {
                  var ScrollY = window.scrollY, dScrollY = em.parent.offsetTop - (cheight || q('.unit-header-container', {first: true}).height) - ScrollY;
                  if(CancelAnimation != null) CancelAnimation();
                  CancelAnimation = q.bezierAnimation(
                    (x) => window.scroll(0, Math.round(ScrollY + dScrollY*x)),
                    500,
                    {
                      timingFunction: 'ease',
                      onend: () => CancelAnimation = null
                    }
                  );
                });
            }
            if(tmp.includes('example')) {
              qc('#exs ul').a('li')
                .classes('topic', 'u')
                .text(data.name)
                .on('click', () => {
                  var ScrollY = window.scrollY, dScrollY = em.parent.offsetTop - (cheight || q('.unit-header-container', {first: true}).height) - ScrollY;
                  if(CancelAnimation != null) CancelAnimation();
                  CancelAnimation = q.bezierAnimation(
                    (x) => window.scroll(0, Math.round(ScrollY + dScrollY*x)),
                    500,
                    {
                      timingFunction: 'ease',
                      onend: () => CancelAnimation = null
                    }
                  );
                });
            }
          }
        }
      });
  }
)(
  // Event Handlers
  () => {
    var i, c, firstFunky = 2;
    var pcurr, poff, stickyEnabled = q.isCSSValueSupported('position', 'sticky');
    window
      .on('resize', () => {
        // Update sidebar scrolling
        _lscrollMax = qc('#sidelist > .sidescroll-container > div:not(:last-child)').width.sum();
        lscroll = sidelistWidth() * li;

        // Update sticky/pushy widths
        q('.unit-header-container.pushy, .unit-header-container.sticky', {forceList: true})
          .style('width', qc('.unit-header-anchor:first-child').width);
      }, true)
      .if(!stickyEnabled, (t) => {
        t.on('scroll', () => {
          // Make headers sticky to the top of the window
          if(stickyEnabled) return;

          var atop, cache, curr, tmp;
          qc('.unit-header-anchor')
            .foreach((anchor, count) => {
              if(curr) return;

              atop = anchor.offsetTop - window.scrollY;

              // Found current and next headers
              if(count != 0 && atop > 0) {
                curr = cache || qc('.unit-header-anchor:first-child');
                cheight = curr.height;

                // New current header, reset previous
                if(pcurr && pcurr.em != curr.em) {
                  pcurr
                    .style('top', '')
                    .style('transform', '')
                    .style('width', '')
                    .remClass('sticky', 'pushy');
                  curr
                    .addClass('sticky')
                    .style('width', anchor.width);

                  pcurr.previousSibling
                    .style('height', '');
                  curr.previousSibling
                    .style('height', cheight);

                  poff = 0;
                } else if(!pcurr) {
                  curr
                    .addClass('sticky')
                    .style('width', anchor.width);

                  curr.previousSibling
                    .style('height', cheight);

                  poff = 0;
                }
                // New current header position, change
                if(atop < cheight && atop > 0 && poff == 0) {
                  curr
                    .class('pushy', 'sticky')
                    .style('top', curr.nextSibling.outerHeight + curr.previousSibling.offsetTop + 10 + (firstFunky && 20));
                  poff = 1;
                } else if(atop > cheight && poff == 1) {
                  curr
                    .class('sticky', 'pushy')
                    .style('top', '');
                  poff = 0;
                }
                  // curr.style('top', poff = atop - cheight);

                pcurr = curr;
              } else {
                cache = anchor.nextSibling;
              }
            });

          // Current header is last one, so treat it as any other
          if(!curr) {
            tmp = qc('.unit-header-anchor');
            curr = (tmp = tmp[tmp.length - 1]).nextSibling; // last header
            atop = tmp.offsetTop - window.scrollY;

            if(pcurr && pcurr != curr) {
              pcurr.style('top', '').remClass('sticky');
              curr.addClass('sticky');
              pcurr = curr;
            } else pcurr = curr;
          }

          firstFunky = Math.max(firstFunky - 1, 0);
        }, true);
      });

    for(i=0, c=qc('#sidelistindex .sidescroll-container').childCount; i<c; i++) ((index, i) => {
      index
        // Jump click to sidebar index
        .on('click', () => {
          li = i;
          scrollSidebar(true);
        });
    })(qc('#sidelistindex .sidescroll-container').c(i), i);

    var made, nid;
    for(i=0, c=qc('#sidelist .sidescroll-container').childCount; i<c; i++) ((list) => {
      list
        .on('wheel', (e) => {
          // Scroll sidelist horizontally
          var dx = e.deltaX, spx = lscroll;
          if(e.deltaMode == 1) dx *= 19;
          else if(e.deltaMode == 2) dx *= side.width;
          lscroll += dx;
          if(lscroll != spx) {
            if(!qc('#sidelist').hasClass('scrolling'))
              qc('#sidelist, #sidelistindex')
                .addClass('scrolling');
            scrollSidebar();
          }

          function snap() {
            qc('#sidelist, #sidelistindex').remClass('scrolling');

            clearTimeout(made);

            window.on('mousemove').remove(nid);
            nid = undefined;

            li = Math.round(li);
            scrollSidebar(true);
          }

          clearTimeout(made);
          made = setTimeout(snap, 500);

          if(!nid)
            nid = window.on('mousemove').add(snap).id;
        });
    })(qc('#sidelist .sidescroll-container').c(i))
  }
)(
  // Math processing
  () => {
    var text, out, i, c, xor = 1, i0;
    q('m', {forceList: true}).foreach((em) => {
      text = em.html(), out = '';
      for(i=0, c=text.length; i<c; i++) {
        if(text[i] == '`') {
          xor ^= 1; // 0 means math
          if(!xor)
            i0 = i + 1;
          else {
            try {
              out += katex.renderToString(text.substr(i0, i - i0));
            } catch(e) {
              out += '<e>' + text.substr(i0, i - i0) + '</e>';
              console.log(e.message);
            }
          }
        } else if(xor) out += text[i];
      }
      em.html(out);
    });
  }
);

'use strict';
// Setup
q.setup({
  cacheTimeout: Infinity,
  cacheLength: 40
});

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

var CancelAnimation, cheight;

// Code Chain
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
    var i, c, firstFunky = true;
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

          firstFunky = false;
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

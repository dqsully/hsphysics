'use strict';

q.onready(
  () => {
    // Metric Conversion Calculator (mcc)
    var
      mccNumIn = q('.mcc.inputs input.number'),
      mccPrefixIn = q('.mcc.inputs select.prefix'),
      mccUnitIn = q('.mcc.inputs input.unit'),
      mccNumOut = q('.mcc.outputs input.number.out'),
      mccPrefixOut = q('.mcc.outputs select.prefix'),
      mccUnitOut = q('.mcc.outputs input.unit.out'),
      mccExplanation = q('.mcc.explanation');


    function mccCalculate() {
      var
        num = +mccNumIn.text(),
        powin = +mccPrefixIn.text(),
        powout = +mccPrefixOut.text(),
        unit = mccUnitIn.text(),
        prefIn = mccPrefixIn.text() == 0 ? '' : mccPrefixIn.em.options[mccPrefixIn.selected()].textContent,
        prefOut = mccPrefixOut.text() == 0 ? '' : mccPrefixOut.em.options[mccPrefixOut.selected()].textContent,
        output;

      mccNumOut
        .text(output = num * Math.pow(10, powin - powout));

      mccExplanation.fc
        .html(katex.renderToString(
          '{' + num + '\\space ' + prefIn + unit + '\\over 1}\\times' +
          '{10e' + powin + '\\space ' + unit + '\\over 1\\space ' + prefIn + unit + '}\\times' +
          '{1\\space ' + unit + '\\over 10e' + powout + '\\space ' + prefOut + unit + '}' +
          '=' + output.toString().replace('+', '') + '\\space ' + prefOut + unit
        ));
    }

    mccNumIn
      .on('keyup', mccCalculate)
      .on('change', mccCalculate);
    mccPrefixIn
      .on('change', mccCalculate);
    mccUnitIn
      .on('keyup', () => {
        // Rename output unit
        mccUnitOut
          .text(mccUnitIn.text());
      }, true)
      .on('keyup', mccCalculate)
      .on('change', mccCalculate);
    mccPrefixOut
      .on('change', mccCalculate);

    mccCalculate();
  }
)

'use strict';

var plural = (s) => s == 1 ? '' : 's';

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

    mccNumIn.text(Math.floor(100*Math.random()));

    function mccCalculate() {
      var
        num = +mccNumIn.text(),
        powin = +mccPrefixIn.text(),
        powout = +mccPrefixOut.text(),
        unit = mccUnitIn.text(),
        prefIn = powin == 0 ? '' : mccPrefixIn.c(mccPrefixIn.sel()).text(),
        prefOut = powout == 0 ? '' : mccPrefixOut.c(mccPrefixOut.sel()).text(),
        output;

      mccNumOut
        .text(output = num * Math.pow(10, powin - powout));

      mccExplanation.fc
        .html(katex.renderToString(
          `{${num}\\space ${prefIn}${unit}${plural(num)}\\over 1}\\times` +
          `{10e${powin}\\space ${unit}s\\over 1\\space ${prefIn}${unit}}\\times` +
          `{1\\space ${unit}\\over 10e${powout}\\space ${prefOut}${unit}s}` +
          `=${output.toString().replace('+', '')}\\space ${prefOut}${unit}${plural(output)}`
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
)(
  () => {
    // English to Metric Conversion Calculator (etmcc)
    var
      etmccNumIn = q('.etmcc.inputs input.number'),
      etmccUnitIn = q('.etmcc.inputs select.unit'),
      etmccNumOut = q('.etmcc.outputs input.number.out'),
      etmccUnitOut = q('.etmcc.outputs select.unit'),
      etmccExplanation = q('.etmcc.explanation');

    etmccNumIn.text(Math.floor(100*Math.random()));

    function etmccCalculate() {
      var unit = (etmccUnitIn.c(etmccUnitIn.sel()).attr('metric') == null) + (etmccUnitOut.c(etmccUnitOut.sel()).attr('metric') == null) * 2;

      if(unit == 0) {
        // Metric to Metric conversion

        var
          num = +etmccNumIn.text(),
          powin = +etmccUnitIn.text(),
          powout = +etmccUnitOut.text(),
          unitin = etmccUnitIn.c(etmccUnitIn.sel()).text(),
          unitout = etmccUnitOut.c(etmccUnitOut.sel()).text(),
          output;

        etmccNumOut
          .text(output = num * Math.pow(10, powin - powout));

        etmccExplanation.fc
          .html(katex.renderToString(
            `{${num}\\space ${unitin}${plural(num)}\\over 1}\\times` +
            `{10e${powin}\\space liters\\over 1\\space ${unitin}}\\times` +
            `{1\\space ${unitout}\\over 10e${powout}\\space liters}` +
            `=${output.toString().replace('+', '')}\\space ${unitout}${plural(output)}`
          ));
      } else if(unit == 1) {
        // English to Metric conversion

        var
          num = +etmccNumIn.text(),
          mulin = +etmccUnitIn.text(),
          powout = +etmccUnitOut.text(),
          unitin = etmccUnitIn.c(etmccUnitIn.sel()).text().replace(' ', '\\space '),
          unitout = etmccUnitOut.c(etmccUnitOut.sel()).text(),
          output;

        etmccNumOut
          .text(output = num * mulin * 0.000123229167 / Math.pow(10, powout));

        etmccExplanation.fc
          .html(katex.renderToString(
            `{${num}\\space ${unitin}${plural(num)}\\over 1}\\times` +
            `{${mulin}\\space minim${plural(mulin)}\\over 1\\space ${unitin}}\\times` +
            `{1.23229167e-4\\space liters\\over 1\\space minim}\\times` +
            `{1\\space ${unitout}\\over 10e${powout}\\space liters}` +
             `=${output.toString().replace('+', '')}\\space ${unitout}${plural(output)}`
          ));
      } else if(unit == 2) {
        // Metric to English conversion

        var
          num = +etmccNumIn.text(),
          powin = +etmccUnitIn.text(),
          mulout = +etmccUnitOut.text(),
          unitin = etmccUnitIn.c(etmccUnitIn.sel()).text(),
          unitout = etmccUnitOut.c(etmccUnitOut.sel()).text().replace(' ', '\\space '),
          output;

        etmccNumOut
          .text(output = num * Math.pow(10, powin) / 0.000123229167 / mulout);

        etmccExplanation.fc
          .html(katex.renderToString(
            `{${num}\\space ${unitin}${plural(num)}\\over 1}\\times` +
            `{10e${powin}\\space liters\\over 1\\space ${unitin}}\\times` +
            `{1\\space minim\\over 1.23229167e-4\\space liters}\\times` +
            `{1\\space ${unitout}\\over ${mulout}\\space minim${plural(mulout)}}` +
            `=${output.toString().replace('+', '')}\\space ${unitout}${plural(output)}`
          ));
      } else if(unit == 3) {
        // English to English conversion

        var
          num = +etmccNumIn.text(),
          mulin = +etmccUnitIn.text(),
          mulout = +etmccUnitOut.text(),
          unitin = etmccUnitIn.c(etmccUnitIn.sel()).text().replace(' ', '\\space '),
          unitout = etmccUnitOut.c(etmccUnitOut.sel()).text().replace(' ', '\\space '),
          output;

        etmccNumOut
          .text(output = num * mulin / mulout);

        etmccExplanation.fc
          .html(katex.renderToString(
            `{${num}\\space ${unitin}${plural(num)}\\over 1}\\times` +
            `{${mulin}\\space minim${plural(mulin)}\\over 1\\space ${unitin}}` +
            `{1\\space ${unitout}\\over ${mulout}\\space minim${plural(mulout)}}` +
            `=${output.toString().replace('+', '')}\\space ${unitout}${plural(output)}`
          ));
      }
    }

    etmccNumIn
      .on('keyup', etmccCalculate)
      .on('change', etmccCalculate);
    etmccUnitIn
      .on('keyup', () => {
        // Rename output unit
        etmccUnitOut
          .text(etmccUnitIn.text());
      }, true)
      .on('keyup', etmccCalculate)
      .on('change', etmccCalculate);
    etmccUnitOut
      .on('change', etmccCalculate);

    etmccCalculate();
  }
)(
  () => {
    // Significant Digits Calculator (sdc)
    var
      sdcIn = q('.sdc.inputs input.number'),
      sdcSigfigsFirst = q('.sdc.outputs .out.sigfigs .ignored.prefix'),
      sdcSigfigsSecond = q('.sdc.outputs .out.sigfigs .important'),
      sdcSigfigsThird = q('.sdc.outputs .out.sigfigs .ignored.postfix'),
      sdcScinot = q('.sdc.outputs .out.scientific');

    var
      testText = '',
      c, i;

    c = Math.floor(Math.random() * 10);
    for(i = 0; i < c; i++)
      testText += '0';

    c = Math.floor(Math.random() * 10);
    for(i = 0; i < c; i++)
      testText += '' + Math.floor(Math.random() * 10);

    c = Math.floor(Math.random() * 5 + 1);
    for(i = 0; i < c; i++)
      testText += '0';

    testText += '.';

    c = Math.floor(Math.random() * 5 + 2);
    for(i = 0; i < c; i++)
      testText += '0';

    sdcIn.text(testText);

    function sdcCalculate() {
      var
        num = sdcIn.text(),
        prefix = '', postfix = '';

      for(i = 0; i < num.length; i++) {
        if(num[i] == '0' || num[i] == '.')
          prefix += num[i];
        else
          break;
      }

      sdcSigfigsFirst
        .html(prefix);

      num = num.substr(prefix.length);

      if(num.includes('.') || prefix.includes('.'))
        sdcSigfigsThird
          .html('');
      else {
        for(i = num.length - 1; i >= 0; i--) {
          if(num[i] == '0')
            postfix += '0';
          else
            break;
        }

        sdcSigfigsThird
          .html(postfix);

        num = num.substr(0, num.length - postfix.length);
      }

      sdcSigfigsSecond
        .html(num);


      if(num.includes('.'))
        sdcScinot
          .html(
            `${num[0]}.${num.substr(1).replace('.', '')}e${num.indexOf('.') - 1}`
          );
      else {
        if(prefix.includes('.'))
          sdcScinot
            .html(
              `${num[0]}.${num.substr(1)}e-${prefix.length - prefix.indexOf('.')}`
            );
        else
          sdcScinot
            .html(
              `${num[0]}.${num.substr(1)}e${num.length + postfix.length - 1}`
            );
      }
    }

    sdcIn
      .on('keyup', sdcCalculate)
      .on('change', sdcCalculate);

    sdcCalculate();
  }
)(
  () => {
    // Displacement, Velocity, Acceleration Calculator (dva)
    var
      a = (Math.random() - 0.5) * 20,
      b = (Math.random() - 0.5) * 20 * 10,
      c = (Math.random() - 0.5) * 20 * 100,
      d = (Math.random() - 0.5) * 20 * 1000;

    q('.graph-placeholder.dva').insertAfterThis(makeGraph({
      data: [
        (x) => a * x**3 + b * x**2 + c * x + d,
        (x) => a * 3 * x**2 + b * 2 * x + c,
        (x) => a * 6 * x + b
      ],
      'x-min': -10,
      'x-max': 10,
      width: 500,
      title: 'Sample Displacement, Velocity, and Acceleration',
      'iv-title': 'Time',
      'data-color': [
        '#eb376d',
        '#852dfb',
        '#15ff00'
      ],
      legend: [
        'Displacement',
        'Velocity',
        'Acceleration'
      ],
      fitting: 'none'
    }));
  }
)

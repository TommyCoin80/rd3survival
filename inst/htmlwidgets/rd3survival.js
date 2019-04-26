HTMLWidgets.widget({

  name: 'rd3survival',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    return {

      renderValue: function(x) {

        // TODO: code to render the widget, e.g.
        //el.innerText = x.message;
        var surv = d3.survival(x)
        
        d3.select(el).call(surv);
        
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
var delta = 0;
var spliced = false;
var d = new Date();
var sid = '' + d.getDate() + d.getMonth() + d.getFullYear();
var addPoint = function(temp) {
  if (isNaN(parseInt(temp, 10)) || !temp) {
    return;
  }
  points.push({
    x: Date.now() / 1000,
    y: parseFloat(temp, 10)
  });
  if (points.length === 2 && !spliced) {
    spliced = true;
    points.splice(0, 1);
  }
  window.localStorage.setItem(sid, JSON.stringify(points));
};
var points = window.localStorage.getItem(sid);
if (!points) {
  points = [];
  addPoint(1);
}
else {
  points = JSON.parse(points);
}


$(document).ready(function() {
  var tb = localStorage.getItem('shiny_below');
  if (tb) {
    $('#target_below').val(tb);
  }
  var ta = localStorage.getItem('shiny_above');
  if (ta) {
    $('#target_above').val(ta);
  }
  var notified;
  var notify = function() {
    notified = true;
    $('body').append('<iframe src="//www.youtube.com/embed/FoX7vd30zq8?autoplay=1"></iframe>');
  };
  var retries = 0;
  var fetchTemp = function() {
    $.ajax({
      url: "http://10.0.0.20:1337",
      timeout: 5000,
      success: function(d) {
        retries = 0;
        $('#temp').text(d);
        addPoint(d);
        var target_above = parseInt($('#target_above').val(), 10);
        var target_below = parseInt($('#target_below').val(), 10);
        var val = parseInt(d, 10);
        if (val < target_below && !notified) {
          notify();
        }
        if (val > target_above && !notified) {
          notify();
        }
        setTimeout(fetchTemp, 2000);
      },
      error: function() {
        // Try to reconnect.
        if (retries < 8) {
          retries++;
          console.log('Retrying. Try number ' + retries);
          setTimeout(fetchTemp, 2000);
          return;
        }
        notify();
        setTimeout(function() {
          alert('Error. Reload please!');
        }, 5000);
      }
    });
  };
  fetchTemp();
  $('#target_below').change(function() {
    // Remember this until next time.
    localStorage.setItem('shiny_below', $(this).val());
  });
  $('#target_above').change(function() {
    // Remember this until next time.
    localStorage.setItem('shiny_above', $(this).val());
  });
});
var palette = new Rickshaw.Color.Palette( { scheme: 'classic9' } );
var graph = new Rickshaw.Graph( {
  element: document.getElementById("chart"),
  width: 800,
  height: 150,
  renderer: 'line',
  stroke: true,
  preserve: true,
  series: [
   {
    color: palette.color(),
    data: points,
    name: 'Temp'
   }
  ]
 } );
graph.render();
var preview = new Rickshaw.Graph.RangeSlider( {
	graph: graph,
	element: document.getElementById('preview')
} );

var hoverDetail = new Rickshaw.Graph.HoverDetail( {
	graph: graph,
	xFormatter: function(x) {
		return new Date(x * 1000).toString();
	}
} );
var ticksTreatment = 'glow';

var xAxis = new Rickshaw.Graph.Axis.Time( {
	graph: graph,
	ticksTreatment: ticksTreatment,
	timeFixture: new Rickshaw.Fixtures.Time.Local()
} );

xAxis.render();

var yAxis = new Rickshaw.Graph.Axis.Y( {
	graph: graph,
	tickFormat: Rickshaw.Fixtures.Number.formatBase1024KMGTP,
	ticksTreatment: ticksTreatment
} );

yAxis.render();
setInterval(function() {
  graph.render();
  xAxis.render();
  yAxis.render();
}, 2000);

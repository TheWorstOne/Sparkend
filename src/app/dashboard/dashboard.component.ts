import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef, ViewChildren } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RestService } from '../rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as Chartist from 'chartist';
import { ConsultaRutas } from 'model/1-2-consulta-rutas/consulta-rutas.model';
import { ConsultaRuta } from 'model/3-consulta-ruta/consulta-ruta.model';
import { ConsultaAerolineas } from 'model/4-5-consulta-aerolineas/consulta-aerolineas.model';
import { ConsultaAerolinea } from 'model/6-7-consulta-aerolinea/consulta-aerolinea.model';
import { HttpClientModule } from '@angular/common/http'; import { HttpModule } from '@angular/http';

declare function require(name: string);
require('chartist-plugin-legend');

//import 'chartist-plugin-legend';
import { element } from 'protractor';
import { QueryPrimeraService } from 'services/query-primera.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  /// FREDDY 
  public consultaRutasLlegada: ConsultaRutas[];
  public consultaRutasDestino: ConsultaRutas[];
  public consultaRutaEspecifico: ConsultaRuta[];
  public consultaRutaEspecifico1: ConsultaRuta;
  public consultaAerolineasLlegada: ConsultaAerolineas[];
  public consultaAerolineasSalida: ConsultaAerolineas[];
  public consultaAerolineaMasRetraso: ConsultaAerolinea[];
  public consultaAerolineaMenosRetraso: ConsultaAerolinea[];
  public consultaAerolineaMasRetraso1: ConsultaAerolinea;
  public consultaAerolineaMenosRetraso1: ConsultaAerolinea;
  public puntos = [];


  //MIGUEL
  panelOpenState: boolean = false;

  displayedColumns = ['aerolinea', 'origen', 'destino', 'conteo'];
  displayedColumns12 = ['categoria', 'conteo'];

  dataSource8: MatTableDataSource<any>;
  dataSource9: MatTableDataSource<any>;
  dataSource12: MatTableDataSource<any>;

  private paginator8: MatPaginator;
  private paginator9: MatPaginator;

  @ViewChild('paginator8') set matPaginator(mp: MatPaginator) {
    this.paginator8 = mp;
    this.dataSource8.paginator = this.paginator8;
  }

  @ViewChild('paginator9') set matPaginator9(mp: MatPaginator) {
    this.paginator9 = mp;
    this.dataSource9.paginator = this.paginator9;
  }


  constructor(public rest: RestService, private route: ActivatedRoute,
    public dialog: MatDialog, private router: Router, private cdRef: ChangeDetectorRef, private queryPrimeraService: QueryPrimeraService) {

    //var aux = new legend(); //without this line, you get 'Chartist.plugins undefined'

    // Assign the data to the data source for the table to render
    this.dataSource8 = new MatTableDataSource();
    this.dataSource9 = new MatTableDataSource();
    this.dataSource12 = new MatTableDataSource();

    this.dataSource8.paginator = this.paginator8;
    this.dataSource9.paginator = this.paginator9;

    this.getCategoryCount();
    this.getDelayCount();

    this.puntos=[
      { value: 'ABE', viewValue: 'ABE' },
      { value: 'ABQ', viewValue: 'ABQ' },
      { value: 'ACY', viewValue: 'ACY' },
      { value: 'ALB', viewValue: 'ALB' },
      { value: 'AMA', viewValue: 'AMA' },
      { value: 'ANC', viewValue: 'ANC' },
      { value: 'ATL', viewValue: 'ATL' },
      { value: 'AUS', viewValue: 'AUS' },
      { value: 'AVL', viewValue: 'AVL' },
      { value: 'AVP', viewValue: 'AVP' },
      { value: 'BDL', viewValue: 'BDL' },
      { value: 'BGM', viewValue: 'BGM' },
      { value: 'BHM', viewValue: 'BHM' },
      { value: 'BNA', viewValue: 'BNA' },
      { value: 'BOI', viewValue: 'BOI' },
      { value: 'BOS', viewValue: 'BOS' },
      { value: 'BTV', viewValue: 'BTV' },
      { value: 'BUF', viewValue: 'BUF' },
      { value: 'BUR', viewValue: 'BUR' },
      { value: 'BWI', viewValue: 'BWI' },
    ];
    this.getConsulta1();
    this.getConsulta2();
    this.getConsulta3(NaN, NaN);
    this.getConsulta4();
    this.getConsulta5();
    this.getConsulta6();
    this.getConsulta7();

  }



  startAnimationForLineChart(chart) {
    let seq: any, delays: any, durations: any;
    seq = 0;
    delays = 80;
    durations = 500;

    chart.on('draw', function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq = 0;
  };

  startAnimationForBarChart(chart, style = {}) {
    let seq2: any, delays2: any, durations2: any;

    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on('draw', function (data) {
      if (data.type === 'bar') {
        seq2++;
        data.element.attr(style);
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq2 = 0;
  };


  ngOnInit() {

    /* ----------==========     Historico de vuelos por origen/destino    ==========---------- */
    this.drawQuery15();

    this.drawQuery16();

    /* ----------==========     Historico de vuelos cancelados por origen/destino    ==========---------- */
    this.drawQuery11();

    /* ----------==========     Historico de vuelos no cancelados    ==========---------- */
    this.drawQuery10();
  }

  ngAfterViewInit() {
    this.dataSource8.paginator = this.paginator8;
    this.dataSource9.paginator = this.paginator9;
    this.dataSource12.paginator = this.paginator9;
    this.cdRef.detectChanges();
  }

  /* ----------==========     Conteo de retrasos por ruta llegada/salida    ==========---------- */
  getDelayCount() {
    /*this.rest.getDelayCount(arr_dep).subscribe((data: any[]) => {
      this.dataSource.data = data
      console.log(data)
    });*/
    this.dataSource8.data = this.rest.getDelayCount("eigth");
    this.dataSource9.data = this.rest.getDelayCount("ninth");
  }

  /* ----------==========     Categorias por las que se cancelan    ==========---------- */
  getCategoryCount() {
    /*this.rest.getCategoryCount(arr_dep).subscribe((data: any[]) => {
      this.dataSource.data = data
      console.log(data)
    });*/
    this.dataSource12.data = this.rest.getCategoryCount();
  }


  /* ----------==========     Historico de vuelos no cancelados    ==========---------- */
  drawQuery10() {

    /*this.rest.getDelayCount(arr_dep).subscribe((data: any[]) => {
      this.dataSource.data = data
      console.log(data)
    });*/

    var q10 = this.rest.getNotCancelledFlights();

    var dataQuery10 = {
      labels: [],
      series: [
        []
      ]
    };

    q10.forEach((element) => {
      dataQuery10.labels.push(element.Time);
      dataQuery10.series[0].push(element.count);
    });


    var optionsQuery10 = {
      axisX: {
        showGrid: false
      },
      axisY: {
        showLabel: true,
        scaleMinSpace: 15,
      },
      low: 0,
      high: 2100,
      chartPadding: { top: 0, right: 5, bottom: 0, left: 0 }
    };

    var responsiveOptions: any[] = [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function (value) {
            return value[0];
          }
        }
      }]
    ];
    var Query10 = new Chartist.Bar('#Query10', dataQuery10, optionsQuery10, responsiveOptions);

    //start animation for the NotCancelledFlights History Chart
    let seq2: any, delays2: any, durations2: any;

    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    Query10.on('draw', function (data) {
      if (data.type === 'bar') {
        seq2++;
        //setup style settings for line barchart
        data.element.attr({
          style: "stroke-width: 5px;"
        });
        // We use the group element of the current series to append a simple circle 
        // with the bar peek coordinates and a circle radius that is depending on the value
        var circle = new Chartist.Svg('circle', {
          cx: data.x2,
          cy: data.y2,
          r: 5
        }, 'ct-slice-pie');
        //setup style settings for lollipop radius
        data.group.append(circle.attr({
          style: "fill: rgba(232, 230, 227, 0.95);" +
            "stroke: rgba(232, 230, 227, 0.95);"
        }, "style"));

        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });
  }

  /* ----------==========     Historico de vuelos cancelados por origen/destino    ==========---------- */
  drawQuery11() {

    /*this.rest.getCancelledFlights(arr_dep).subscribe((data: any[]) => {
      this.dataSource.data = data
      console.log(data)
    });*/

    var q11 = this.rest.getCancelledFlights();
    q11.sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : 0);

    var dataQuery11 = {
      labels: [],
      series: [
        []
      ]
    };

    q11.forEach((element) => {
      dataQuery11.labels.push(element.time);
      dataQuery11.series[0].push(element.count);
    });

    const optionsQuery11: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0
      }),
      low: 0,
      high: 250,
      showArea: true,
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 }
    }

    var Query11 = new Chartist.Line('#Query11', dataQuery11, optionsQuery11);

    // start animation for the History of Cancelled Flights Chart - Line Chart
    this.startAnimationForLineChart(Query11);
  }

  /* ----------==========     Historico de vuelos por origen/destino    ==========---------- */
  drawQuery15() {

    /*this.rest.getCancelledFlights(arr_dep).subscribe((data: any[]) => {
      this.dataSource.data = data
      console.log(data)
    });*/

    var q15 = this.rest.getOriginCount();
    q15.sort((a, b) => a.agno < b.agno ? -1 : a.agno > b.agno ? 1 : 0);


    var dataQuery15 = {
      labels: [],
      series: [
        []
      ]
    };

    q15.forEach((element) => {
      dataQuery15.labels.push(element.agno);
      dataQuery15.series[0].push(element.count);
    });

    const optionsQuery15: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0,
        fillHoles: true
      }),
      low: 0,
      high: 250,
      showArea: true,
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 }
    }

    var plugins = [
      Chartist.plugins.legend({
        legendNames: ['Origen', 'Destino']
      })
    ];

    var Query15 = new Chartist.Line('#Query15', dataQuery15, optionsQuery15, plugins);

    // start animation for the Origin Flights History Chart - Line Chart
    this.startAnimationForLineChart(Query15);
  }

  drawQuery16() {

    /*this.rest.getCancelledFlights(arr_dep).subscribe((data: any[]) => {
      this.dataSource.data = data
      console.log(data)
    });*/

    var q16 = this.rest.getDestinationCount();
    q16.sort((a, b) => a.agno < b.agno ? -1 : a.agno > b.agno ? 1 : 0);


    var dataQuery16 = {
      labels: [],
      series: [
        []
      ]
    };

    q16.forEach((element) => {
      dataQuery16.labels.push(element.agno);
      dataQuery16.series[0].push(element.count);
    });

    const optionsQuery16: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0,
        fillHoles: true
      }),
      low: 0,
      high: 2050,
      showArea: true,
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 }
    }

    var plugins = [
      Chartist.plugins.legend({
        legendNames: ['Origen', 'Destino']
      })
    ];

    var Query16 = new Chartist.Line('#Query16', dataQuery16, optionsQuery16, plugins);

    // start animation for the Origin Flights History Chart - Line Chart
    this.startAnimationForLineChart(Query16);
  }


  refresh() {
    // Assign the data to the data source for the table to render
    this.dataSource8 = new MatTableDataSource();
    this.dataSource9 = new MatTableDataSource();
    this.dataSource12 = new MatTableDataSource();
    this.dataSource8.paginator = this.paginator8;
    this.dataSource9.paginator = this.paginator9;
  }

  public getConsulta1() {
    this.queryPrimeraService.getConsulta1().subscribe(_consultaLlegadaRutas => {
      this.consultaRutasLlegada = _consultaLlegadaRutas;
    });
  }
  public getConsulta2() {
    this.queryPrimeraService.getConsulta2().subscribe(_consultaDestinoRutas => {
      this.consultaRutasDestino = _consultaDestinoRutas;
    });
  }
  public getConsulta3(selectedValueOrigin, selectedValueDest) {
    if (selectedValueOrigin== NaN || selectedValueDest== NaN || selectedValueDest == selectedValueOrigin) {
      alert('Error');
    } 
    else {
      this.queryPrimeraService.getConsulta3(selectedValueOrigin, selectedValueDest).subscribe(_consultaRutaEspecifico => {
        this.consultaRutaEspecifico1 = _consultaRutaEspecifico[0];
      });
    }

  }
  public getConsulta4() {
    this.queryPrimeraService.getConsulta4().subscribe(_consultaAerolineasLlegada => {
      this.consultaAerolineasLlegada = _consultaAerolineasLlegada;
    });
  }
  public getConsulta5() {
    this.queryPrimeraService.getConsulta5().subscribe(_consultaAerolineasSalida => {
      this.consultaAerolineasSalida = _consultaAerolineasSalida;
    });
  }
  public getConsulta6() {
    this.queryPrimeraService.getConsulta6().subscribe(_consultaAerolineaMasRetraso => {
      this.consultaAerolineaMasRetraso = _consultaAerolineaMasRetraso;
      this.consultaAerolineaMasRetraso1 = _consultaAerolineaMasRetraso[0];
    });
  }
  public getConsulta7() {
    this.queryPrimeraService.getConsulta7().subscribe(_consultaAerolineaMenosRetraso => {
      this.consultaAerolineaMenosRetraso = _consultaAerolineaMenosRetraso;
      this.consultaAerolineaMenosRetraso1 = _consultaAerolineaMenosRetraso[0];
    });
  }

}

import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  qrData = null;
  createdCode = null;
  scannedCode = null;
 
  private codeRef;
  codes: Observable<any[]>;
  codesArray: any = [];

  constructor(private barcodeScanner: BarcodeScanner,
              public db: AngularFireDatabase,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController) {

    this.codeRef = db.list('code');
    this.codes = db.list('code').snapshotChanges();
    this.updateCode();

  }
 
  updateCode(){

   // this.codesArray = []

    this.codes.subscribe((value) => {
      value.forEach(data => {        
        this.codesArray.push(data.payload.val());
      })

    })
  }

  scanCode() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.barcodeScanner.scan().then(barcodeData => {
      loading.present();
      if(this.codesArray.indexOf(barcodeData.text) === -1){

        this.db.list('code').push(barcodeData.text)
          .then(() => {
            this.updateCode();
            loading.dismiss();
            const alert = this.alertCtrl.create({
              title: 'ENTRADA LIBERADA',
              subTitle: 'O ingresso esta VALIDO e a entrada do convidado esta liberada',
              buttons: ['OK']
            });
            alert.present();            
          });

      } else if (this.codesArray.indexOf(barcodeData.text) > -1){
        loading.dismiss();
        const alert = this.alertCtrl.create({
          title: 'NÃO LIBERAR ENTRADA',
          subTitle: 'O ingresso esta INVALIDO favor encaminhar o convidado para a proxima saida.',
          buttons: ['OK']
        });
        alert.present();
      }
      
      this.scannedCode = barcodeData.text;
    }, (err) => {
      loading.dismiss();
      const alert = this.alertCtrl.create({
        title: 'ERRO',
        subTitle: 'Reinicie o App',
        buttons: ['OK']
      });
      alert.present();

    });
  }
 
}
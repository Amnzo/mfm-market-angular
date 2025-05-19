import { Component, Input } from '@angular/core';

export interface Commande {
  id: number;
  client_name: string;
  client_mobile: string;
  client_adresse: string;
  total: number;
  credit_sur_commande: number;
  created_at: string;
  status: string;
  items: any[];
  paiements: any[];
  creator_name: string;
  delivery_name: string;
}

@Component({
  selector: 'app-commande-print',
  templateUrl: './commande-print.component.html',
  styleUrls: ['./commande-print.component.css']
})
export class CommandePrintComponent {
  @Input() commande: Commande | null = null;

  constructor() { }

  print() {
    window.print();
  }
}

import { Component } from '@angular/core';

interface CommandeItem {
  item_id: number;
  quantity: number;
  price: string;
  remise: string;
  total_ligne: string;
  product_id: number;
  product_name: string;
}

interface Commande {
  id: number;
  client_name: string;
  client_mobile: string;
  client_adresse: string;
  client_gps: string;
  date_order: string;
  user_id: number;
  total: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  delivery_user_id: number | null;
  cloture_date: string | null;
  credit_sur_commande: string | null;
  items: CommandeItem[];
}

@Component({
  selector: 'app-commande-list',
  templateUrl: './commande-list.component.html',
  //styleUrls: ['./commande-list.component.css']
})
export class CommandeListComponent {
  commandes: Commande[] = [
    {
      id: 114,
      client_name: "dada hiyani",
      client_mobile: "0608878266",
      client_adresse: "Essaada 2, Arrondissement de Ménara مقاطعة المنارة, Marrakech ⵎⵕⵕⴰⴽⵯⵛ مراكش, Pachalik de Marrakech, Préfecture de Marrakech عمالة مراكش, Marrakech-Safi ⵎⵕⵕⴰⴽⵛ-ⴰⵙⴼⵉ مراكش-أسفي, 40036, Maroc ⵍⵎⵖⵔⵉⴱ المغرب",
      client_gps: "31.6718303,-8.0567054",
      date_order: "2025-05-15T00:00:00.000Z",
      user_id: 2,
      total: "154.90",
      status: "livrée",
      created_at: "2025-05-15T22:39:57.000Z",
      updated_at: null,
      delivery_user_id: 3,
      cloture_date: "2025-05-15T21:42:14.561Z",
      credit_sur_commande: "4.900000000000006",
      items: [
        {
          item_id: 96,
          quantity: 10,
          price: "15.49",
          remise: "0.00",
          total_ligne: "154.90",
          product_id: 6,
          product_name: "Product B"
        }
      ]
    },
    {
      id: 113,
      client_name: "hhhhhh",
      client_mobile: "88888",
      client_adresse: "Amphitheatre Parkway, Mountain View, Santa Clara County, California, 94043, United States",
      client_gps: "37.4219983,-122.084",
      date_order: "2025-05-15T00:00:00.000Z",
      user_id: 2,
      total: "4136.47",
      status: "livrée",
      created_at: "2025-05-15T07:19:35.000Z",
      updated_at: null,
      delivery_user_id: 3,
      cloture_date: "2025-05-15T11:42:29.316Z",
      credit_sur_commande: "636.4699999999993",
      items: [
        {
          item_id: 94,
          quantity: 102,
          price: "10.99",
          remise: "0.00",
          total_ligne: "1120.98",
          product_id: 5,
          product_name: "Product A"
        },
        {
          item_id: 95,
          quantity: 201,
          price: "15.49",
          remise: "98.00",
          total_ligne: "3015.49",
          product_id: 6,
          product_name: "Product B"
        }
      ]
    }
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'livrée':
        return 'success';
      case 'en attente':
        return 'warning';
      default:
        return 'info';
    }
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString();
  }
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  stats = {
    totalProducts: 120,
    totalOrders: 45,
    totalPayments: 23450,
    totalUsers: 10,
    commandesEnCours: 5,
    bestSeller: 'Ali Bennani',
    lowStockProducts: 8,
    totalCredit: 4560,
    todayOrders: 4
  };

  constructor() {}

  ngOnInit(): void {}
}

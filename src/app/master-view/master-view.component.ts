import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IGX_CARD_DIRECTIVES, IGX_GRID_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_PIVOT_GRID_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_TABS_DIRECTIVES, IgxIconComponent } from 'igniteui-angular';
import { Subject, take, takeUntil } from 'rxjs';
import { CategoryDto } from '../models/northwind-swagger/category-dto';
import { OrderDetailDto } from '../models/northwind-swagger/order-detail-dto';
import { Query } from '../models/northwind-swagger/query';
import { NorthwindSwaggerService } from '../services/northwind-swagger.service';

@Component({
  selector: 'app-master-view',
  imports: [IGX_INPUT_GROUP_DIRECTIVES, IGX_PIVOT_GRID_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_TABS_DIRECTIVES, IGX_GRID_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxIconComponent, FormsModule],
  templateUrl: './master-view.component.html',
  styleUrls: ['./master-view.component.scss']
})
export class MasterViewComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  private _orderYearAfter: Date = new Date('1995-09-09T00:00');
  public get orderYearAfter(): Date {
    return this._orderYearAfter;
  }
  public set orderYearAfter(value: Date) {
    this._orderYearAfter = value;
    this.salesAfterYearExpression = this.getSalesAfterYearExpression();
  }

  private _salesAfterYearExpression: Query = this.getSalesAfterYearExpression();
  public get salesAfterYearExpression(): Query {
    return this._salesAfterYearExpression;
  }
  public set salesAfterYearExpression(value: Query) {
    this._salesAfterYearExpression = value;
    this.salesAfterYear$.next();
  }
  public salesAfterYear: OrderDetailDto[] = [];
  public salesAfterYear$: Subject<void> = new Subject<void>();


  private _categoryName: string = 'Seafood';
  public get categoryName(): string {
    return this._categoryName;
  }
  public set categoryName(value: string) {
    this._categoryName = value;
    this.salesAfterYearExpression = this.getSalesAfterYearExpression();
  }
  public testC: CategoryDto[] = [];

  constructor(
    private northwindSwaggerService: NorthwindSwaggerService,
  ) {}


  ngOnInit() {
    this.northwindSwaggerService.postQueryBuilderResult(this.salesAfterYearExpression).pipe(takeUntil(this.destroy$)).subscribe(
      data => this.salesAfterYear = data?.orderDetails ?? []
    );
    this.salesAfterYear$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.northwindSwaggerService.postQueryBuilderResult(this.salesAfterYearExpression).pipe(take(1)).subscribe(
        data => this.salesAfterYear = data?.orderDetails ?? []
      );
    });
    this.northwindSwaggerService.getCategoryDtoList().pipe(takeUntil(this.destroy$)).subscribe(
      data => this.testC = data
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.salesAfterYear$.complete();
  }

  private getSalesAfterYearExpression(): Query {
    return {
      filteringOperands: [
        {
          fieldName: 'productId',
          condition: {
            name: 'inQuery',
            isUnary: false,
            iconName: 'in'
          },
          searchTree: {
            filteringOperands: [
              {
                fieldName: 'categoryId',
                condition: {
                  name: 'inQuery',
                  isUnary: false,
                  iconName: 'in'
                },
                ignoreCase: true,
                searchTree: {
                  filteringOperands: [
                    {
                      fieldName: 'name',
                      condition: {
                        name: 'equals',
                        isUnary: false,
                        iconName: 'filter_equal'
                      },
                      ignoreCase: true,
                      searchVal: this.categoryName
                    }
                  ],
                  operator: '0',
                  entity: 'categories',
                  returnFields: [
                    'categoryId'
                  ]
                }
              }
            ],
            operator: '0',
            entity: 'products',
            returnFields: [
              'productId'
            ]
          },
          ignoreCase: true
        },
        {
          fieldName: 'orderId',
          condition: {
            name: 'inQuery',
            isUnary: false,
            iconName: 'in'
          },
          ignoreCase: true,
          searchTree: {
            filteringOperands: [
              {
                fieldName: 'orderDate',
                condition: {
                  name: 'after',
                  isUnary: false,
                  iconName: 'filter_after'
                },
                ignoreCase: true,
                searchVal: this.orderYearAfter
              }
            ],
            operator: '0',
            entity: 'orders',
            returnFields: [
              'orderId'
            ]
          }
        }
      ],
      operator: '0',
      entity: 'orderDetails',
      returnFields: [
        'orderId',
        'productId',
        'unitPrice',
        'quantity',
        'discount'
      ]
    };
  }
}

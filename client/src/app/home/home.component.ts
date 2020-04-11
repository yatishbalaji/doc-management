import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { merge, Observable, of as observableOf, fromEvent, Subject, throwError } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements AfterViewInit {
  docDatabase: DocHttpDatabase | null;
  isLoadingResults: boolean = true;
  resultsLength: number = 0;
  data: any[];
  search = '';
  displayedColumns: string[] = [
    'name', 'created_by', 'created_on', 'users'
  ];

  clickStream = new Subject();
  docSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort

  constructor(
    private _httpClient: HttpClient,
    private auth: AuthService,
    private snackBar: MatSnackBar,
  ) {
  }

  ngAfterViewInit() {
    this.docDatabase = new DocHttpDatabase(this._httpClient);
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.clickStream.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.clickStream)
    .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.docDatabase.getDocs(
          this.sort.active,
          this.sort.direction,
          this.paginator.pageIndex,
          this.search,
        );
      }),
      map(data => {
        this.isLoadingResults = false;
        this.resultsLength = data.length;
        return data;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        return observableOf([]);
      })
      ).subscribe(data => this.docSource.data = data);
  }
  ngOnInit(): void {
    
  }

  removeMovie(row, index) {
    this._httpClient.delete(`http://localhost:5000/api/movies/${row._id}`)
      .pipe(
        map(res => res),
        catchError((err) => throwError(err))
      )
      .subscribe(
        () => {
          this.docSource.data.splice(index, 1);
          this.docSource._updateChangeSubscription();
          this.showError('Movie deleted successfully');
        },
        (err) => this.showError('Something went wrong')
      );
  }

  showError(msg) {
    this.snackBar.open(msg, null, {
      duration: 2000,
    });
  }
}

export class DocHttpDatabase {
  headers: HttpHeaders = new HttpHeaders();

  constructor(private _httpClient: HttpClient) { }

  getDocs(
    sort: string, order: string, page: number, search: string
  ): Observable<any> {
    const href = 'http://localhost:5000/api/file';
    const requestUrl =
      `${href}?search=${search}&sort=${sort}&order=${order}&page=${page + 1}`;

    return this._httpClient.get<any>(requestUrl);
  }
}
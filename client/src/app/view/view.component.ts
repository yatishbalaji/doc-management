import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { merge, Observable, of as observableOf, fromEvent, Subject, throwError } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'doc-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})

export class ViewComponent {
  viewFormGroup: FormGroup;
  isLoadingResults: boolean = true;
  docId: number = 0;
  data: any = {};
  isEdit: boolean = true;
  errMsg: string = '';

  constructor(
    private _httpClient: HttpClient,
    private actRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private http: HttpClient,
  ) {
    this.docId = this.actRoute.snapshot.params.id;
    this.viewFormGroup = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      contents: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    this._httpClient.get(`http://localhost:5000/api/file/${this.docId}`)
      .pipe(
        map(res => res),
        catchError((err) => throwError(err))
      )
      .subscribe((data: any) => {
        this.data = data;
        this.isLoadingResults = false;
        this.viewFormGroup.setValue({
          name: data.name, 
          contents: data.contents
        });
      });
  }

  showError(msg) {
    this.snackBar.open(msg, null, {
      duration: 2000,
    });
  }

  chipColor(character) {
    return "accent";
  }

  onSubmit() {
    const data = {
      name: this.viewFormGroup.get('name').value,
      contents: this.viewFormGroup.get('contents').value,
    };

    const method = this.isEdit ? 'put' : 'post';
    let url = 'http://localhost:5000/api/file';

    if (this.isEdit) url = `${url}/${this.docId}`;

    this.http[method](url, data)
      .pipe(
        map(res => res),
        catchError((err) => throwError(err))
      )
      .subscribe(
        () => {
          this.snackBar.open("Successfully Updated", null, {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        },
        (err) => console.log(err)
      );
  }
}
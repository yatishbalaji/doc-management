import { Component } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ShareComponent } from '../share/share.component';

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
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.docId = this.actRoute.snapshot.params.id;
    this.viewFormGroup = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      contents: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    if (!this.docId)
      this.isLoadingResults = false;
    else
      this._httpClient.get(`/api/file/${this.docId}`)
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

    const method = this.docId ? 'put' : 'post';
    let url = '/api/file';

    if (this.docId) url = `${url}/${this.docId}`;

    this.http[method](url, data)
      .pipe(
        map(res => res),
        catchError((err) => throwError(err))
      )
      .subscribe(
        (res: any) => {
          this.snackBar.open(`Successfully ${this.docId ? "Updated" : "Created"}`, null, {
            duration: 2000,
            panelClass: ['success-snackbar']
          });

          if (!this.docId) {
            this.router.navigateByUrl(`/doc/${res._id}`);
          }
        },
        (err) => console.log(err)
      );
  }

  getChipColor(name) {
    let color = '#ed3800';
    const x = name[0];
    switch (true) {
        case (x > 'P'):
            color = '#82b846'; 
            break;
        case (x > 'G'):
            color = '#f9ad0b';
            break;
    }

    return {'background-color': color};
  }

  shareDoc() {
    this.dialog.open(ShareComponent, {
      data: {
        docId: this.docId,
        users: this.data.users
          .map(u => u._id),
      }
    });
  }
}
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})

export class ShareComponent implements OnInit {
  shareFormGrp: FormGroup;
  errMsg = null;
  data: any = [];
  postData: any = [];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public modalData: any,
  ) {
    this.shareFormGrp = new FormGroup({
      name: new FormControl(null, [Validators.required]),
    });

    console.log(modalData);
  }

  ngOnInit(): void {
    this.http.get('/api/user')
        .pipe(
          map(res => res),
          catchError((err) => throwError(err))
        )
        .subscribe((data: any) => {
          this.data = data.filter(d => !this.modalData.users.includes(d._id));
        });
  }

  showError(msg) {
    this.snackBar.open(msg, null, {
      duration: 2000,
    });
  }

  close() {
    this.dialogRef.close();
  }

  selected(event: MatAutocompleteSelectedEvent, user: any) {
    this.postData = user; 
  }

  onSubmit() {
    this.http.put(
      `/api/file/${this.modalData.docId}/share`, {
        users: [this.postData],
      })
      .pipe(
        map(res => res),
        catchError((err) => throwError(err))
      )
      .subscribe(
        () => {
          this.showError('Shared to user successfully');
          this.close();
        },
        (err) => this.errMsg = err.error.message
      );
  }
}

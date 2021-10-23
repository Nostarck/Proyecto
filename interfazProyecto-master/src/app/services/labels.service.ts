import { Injectable, SkipSelf } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LabelsService {
  constructor(private http: HttpClient) { }

  getTagNames(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/tag/getnames');
  }

  getAllTags(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/tag/getall');
  }

  updateTag(uniqueTagID: string, tagName: string) {
    const body = { tagName: tagName };
    this.http.put<any>('http://localhost:3000/tag/update/' + uniqueTagID, body).subscribe(
      (val) => {
        console.log("POST call successful value returned in body",
          val);
      },
      response => {
        console.log("POST call in error", response);
      },
      () => {
        console.log("The POST observable is now completed.");
      });
  }

  deleteTag(uniqueTagID: string) {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'}),
      body : { uniqueTagID: uniqueTagID }
    };
    return this.http.delete<any>('http://localhost:3000/tag/delete', options).subscribe(
      (val) => {
        console.log("POST call successful value returned in body",
          val);
      },
      response => {
        console.log("POST call in error", response);
      },
      () => {
        console.log("The POST observable is now completed.");
      });
  }

  addTag(tagName: string): Observable<any> {
    const body = { tagName: tagName };
    return this.http.post<any>('http://localhost:3000/tag/add', body);
  }
}
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProblemsService {
  constructor(private http: HttpClient) { }

  // deberia retornar o que espere aca? - no devuelve nada
  getSync(): Observable<any> {
    console.log('controller');
    return this.http.get<any>('http://localhost:3000/problem/sync');
  }

  getJudges(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/problem/judges');
  }

  getAllProblem(uniqueJudgesIDs: string, uniqueTagsIDs: string): Observable<any> {

    const body = { uniqueJudgesIDs: uniqueJudgesIDs,  uniqueTagsIDs: uniqueTagsIDs};

  
    return this.http.post<any>('http://localhost:3000/problem/getall', body);
  }

  updateProblem(uniqueProblemID: string, problemComment: string) {
    const body = { problemComment: problemComment };
    this.http.put<any>('http://localhost:3000/problem/update/' + uniqueProblemID, body).subscribe(
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

  addTagToProblem(uniqueTagsIDs: string, uniqueProblemsIDs: string) {
    const body = { uniqueTagsIDs: uniqueTagsIDs,  uniqueProblemsIDs: uniqueProblemsIDs};
    this.http.put<any>('http://localhost:3000/problem/addtag', body).subscribe(
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

  removeTagFromProblem(uniqueTagsIDs: string, uniqueProblemsIDs: string) {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'}),
      body : { uniqueTagsIDs: uniqueTagsIDs,  uniqueProblemsIDs: uniqueProblemsIDs}
    };
    return this.http.delete<any>('http://localhost:3000/problem/removetag', options).subscribe(
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

}

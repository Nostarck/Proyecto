import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { FormGroup } from "@angular/forms";


@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  constructor(private http: HttpClient) { }

  // https://www.positronx.io/how-to-use-angular-8-httpclient-to-post-formdata/ --> Como subir archivos

  importStudent(form: FormGroup): Observable<any> {
    var formData: any = new FormData();
    formData.append("file", form.get('file').value);
    return this.http.post<any>('http://localhost:3000/student/importstudent', formData);
  }
//sdf
  addStudentToGroup(uniqueStudentsIDs: string, uniqueGroupsIDs: string) {
    const body = { uniqueStudentsIDs: uniqueStudentsIDs,  uniqueGroupsIDs: uniqueGroupsIDs};
    this.http.put<any>('http://localhost:3000/student/addtogroup', body).subscribe(
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

  removeStudentFromGroup(uniqueStudentsIDs: string, uniqueGroupsIDs: string) {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'}),
      body : { uniqueStudentsIDs: uniqueStudentsIDs,  uniqueGroupsIDs: uniqueGroupsIDs}
    };
    return this.http.delete<any>('http://localhost:3000/student/removefromgroup', options).subscribe(
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

  getStudentProfile(uniqueStudentID: string, uniqueTagIDs: string): Observable<any> {
    const body = { uniqueTagIDs : uniqueTagIDs};
    console.log(body.uniqueTagIDs);
    return this.http.post<any>('http://localhost:3000/student/profile/' + uniqueStudentID, body);
  }

  getAllStudent(uniqueGroupID: string): Observable<any> {
    const body = {uniqueGroupID : uniqueGroupID};
    return this.http.post<any>('http://localhost:3000/student/getall', body);
  }

  updateStudent(uniqueStudentID: string, studentID: string, studentName: string, studentLastName: string, judges: string) {
    const body = { studentID: studentID,  studentName: studentName, studentLastName: studentLastName, judges: judges};
    this.http.put<any>('http://localhost:3000/student/update/' + uniqueStudentID, body).subscribe(
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

  deleteStudent(uniqueStudentID: string) {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'}),
      body : { uniqueStudentID: uniqueStudentID }
    };
    return this.http.delete<any>('http://localhost:3000/student/delete/', options).subscribe(
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


  addStudent(studentID: string, studentName: string, studentLastName: string, judges: string, judgeTest: String): Observable<any> {
    const body = { studentID: studentID,  studentName: studentName, studentLastName: studentLastName, judges: judges, judgeTest: judgeTest};
    return this.http.post<any>('http://localhost:3000/student/add', body);
  }
}
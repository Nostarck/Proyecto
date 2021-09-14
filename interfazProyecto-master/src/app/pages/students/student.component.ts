import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { NgModule } from "@angular/core";
import { MaterialModule } from "../../material/material.module";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { GroupsService } from "src/app/services/groups.service";
import { StudentsService } from "src/app/services/students.service";
import { MatDialog } from "@angular/material/dialog";
import { DialogBoxComponent } from "src/app/components/dialog-box/dialog-box.component";
import { DatePipe } from "@angular/common";
import { SelectionModel } from "@angular/cdk/collections";
import { HttpClient } from "@angular/common/http";

declare const google: any;

@NgModule({
  imports: [MaterialModule],
})
@Component({
  selector: "app-maps",
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.scss"],
  providers: [DatePipe],
})
export class StudentComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  form: FormGroup;
  panelOpenState = false;

  groups = new FormControl();

  groupsList: Array<any> = [];
  groupsFilter = new FormControl();

  groupsFilterList: Array<any> = [];

  displayedColumns: string[] = [
    "select",
    "studentId",
    "name",
    "Groups",
    "CodeForces",
    "CodeChef",
    "UVA",
    "fecha",
  ];

  dataSource = new MatTableDataSource();

  allStudentsResult: Array<any> = [];
  selection = new SelectionModel<any>(true, []);

  constructor(
    public dialog: MatDialog,
    private studentsService: StudentsService,
    private groupsService: GroupsService,
    private datePipe: DatePipe,
    public fb: FormBuilder,
    private http: HttpClient
  ) {
    this.getAllGroups(null);
    this.getAllStudents(null);

    this.form = this.fb.group({
      file: [null]
    })
  }
  ngOnInit(): void {}

  getAllGroups(tags: string) {
    if (tags === null) {
      tags = "";
    }
    this.groupsService.getAllGroups(tags).subscribe(
      (data) => {
        this.groupsList = data;
        this.groupsFilterList = data;
      },
      (error) => console.log("Error: ", error)
    );
  }

  getAllStudents(groupId: string) {
    if (groupId === null) {
      groupId = "";
    }
    this.studentsService.getAllStudent(groupId).subscribe(
      (data) => {
        this.allStudentsResult = data;
      },
      (error) => console.log("Error: ", error),
      () => this.refreshRows()
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  refreshTable() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  refreshRows() {
    this.dataSource = new MatTableDataSource(this.allStudentsResult);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row.id
    }`;
  }

  onAddGroup(value: String) {
    if (this.groups.value != null) {
      var groupsIds: Array<string> = [];
      this.groups.value.forEach((value) => {
        const foundIndex = this.groupsList.findIndex((x) => x.name === value);
        groupsIds.push(this.groupsList[foundIndex].id);
      });
      var groupIdsString = groupsIds.map(String).join(";");
    } else var tagIdsString = "";

    var selectStudents: Array<any> = this.selection.selected;

    var studentsIds: Array<string> = [];
    selectStudents.forEach((student) => studentsIds.push(student.id));

    var studentIdsString = studentsIds.map(String).join(";");
    console.log(studentIdsString);
    const selectedGroup = this.groups.value;
    console.log(selectedGroup);

    if (value == "agrupar")
      this.addGroup(studentIdsString, groupIdsString, selectedGroup);

    if (value == "desagrupar")
      this.removeGroup(studentIdsString, groupIdsString, selectedGroup);
  }

  addGroup(studentID: string, groupID: string, selectedGroups) {
    this.studentsService.addStudentToGroup(studentID, groupID);
    var studentsId = studentID.split(";");

    const foundIndex = this.allStudentsResult
      .map((x, i) => (studentsId.includes(x.id) ? i : undefined))
      .filter((x) => x !== undefined);
    foundIndex.map((index) => {
      selectedGroups.forEach((element) => {
        if (!this.allStudentsResult[index].Groups.includes(element)) {
          var groups = [...this.allStudentsResult[index].Groups];
          if (groups[0] === null) {
            groups = [];
          }

          this.allStudentsResult[index].Groups = [...groups, element];
        }
      });
    });

    this.refreshTable();
    return true;
  }

  removeGroup(studentID: string, groupID: string, selectedGroups) {
    this.studentsService.removeStudentFromGroup(studentID, groupID);
    var studentsId = studentID.split(";");
    const foundIndex = this.allStudentsResult
      .map((x, i) => (studentsId.includes(x.id) ? i : undefined))
      .filter((x) => x !== undefined);

    foundIndex.map((index) => {
      selectedGroups.forEach((element) => {
        var indexGroup = this.allStudentsResult[index].Groups.indexOf(element);

        if (indexGroup !== -1) {
          this.allStudentsResult[index].Groups = this.allStudentsResult[
            index
          ].Groups.filter((x) => x !== element);
        }
      });
    });
    this.refreshRows();
    return true;
  }

  openDialog(action, page, obj) {
    obj.action = action;
    obj.page = page;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: "250px",
      data: obj,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.event == "Agregar") {
        this.addRowData(result.data);
      } else if (result.event == "Eliminar") {
        this.deleteRowData(result.data);
      } else if (result.event == "Editar") {
        // console.log(result.data);
        this.updateRowData(result.data);
      }
    });
  }

  addRowData(result) {
    var myDate = this.datePipe.transform(new Date(), "yyyy-MM-dd");
    var judges = [result.CodeForces, result.CodeChef, result.UVA];
    var stringjudge = judges.join(";");
    this.studentsService
      .addStudent(result.studentId, result.name, result.lastName, stringjudge)
      .subscribe(
        (data) => {
          //addStudents solo devuelve el id
          this.allStudentsResult.unshift({
            id: data.id,
            studentId: data.studentid,
            name: result.name,
            lastName: result.lastName,
            creationDate: myDate,
            Groups: data.Groups,
            CodeForces: result.CodeForces,
            CodeChef: result.CodeChef,
            UVA: result.UVA,
          });
        },
        (error) => console.log("Error: ", error),
        () => this.refreshTable()
      );
  }

  deleteRowData(row_obj) {
    row_obj.forEach((row) => {
      this.studentsService.deleteStudent(row.id);
      const foundIndex = this.allStudentsResult.findIndex(
        (x) => x.id === row.id
      );
      this.allStudentsResult.splice(foundIndex, 1);
    });

    this.selection = new SelectionModel<any>(true, []);
    this.refreshTable();
    return true;
  }

  onDelete(action: string, page: string) {
    var rowsToDelete: Array<any> = this.selection.selected;
    console.log(rowsToDelete);

    if (rowsToDelete.length != 0) {
      this.openDialog(action, page, rowsToDelete);
    }
  }

  filterGroups() {
    if (this.groupsFilter.value != null) {
      var groupsIds: Array<string> = [];
      this.groupsFilter.value.forEach((value) => {
        const foundIndex = this.groupsFilterList.findIndex(
          (x) => x.name === value
        );
        groupsIds.push(this.groupsFilterList[foundIndex].id);
      });
      var groupsIdsString = groupsIds.map(String).join(";");
    } else var groupsIdsString = "";
    this.getAllStudents(groupsIdsString);
  }

  updateRowData(row_obj) {
    var judges = [row_obj.CodeForces, row_obj.CodeChef, row_obj.UVA]
    var judgesString =judges.join(";")
    this.studentsService.updateStudent(row_obj.id,row_obj.studentId, row_obj.name, row_obj.lastName, judgesString);
    const foundIndex = this.allStudentsResult.findIndex((x) => x.id === row_obj.id);
    this.allStudentsResult[foundIndex].name = row_obj.name;
    this.allStudentsResult[foundIndex].id= row_obj.id;
    this.allStudentsResult[foundIndex].studentId= row_obj.studentId;
    this.allStudentsResult[foundIndex].lastName =row_obj.lastName;
    this.allStudentsResult[foundIndex].CodeForces =row_obj.CodeForces;
    this.allStudentsResult[foundIndex].CodeChef = row_obj.CodeChef;
    this.allStudentsResult[foundIndex].UVA = row_obj.UVA;

    this.refreshTable();
    return true;
  }

  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({
      file: file
    });
    this.form.get('file').updateValueAndValidity()
  }

  submitForm() {
    console.log(this.form.value)
    this.studentsService.importStudent(this.form).subscribe(
      (response) =>  console.log(response) ,
      (error) => console.log(error),
      () => {
        this.getAllStudents(null);
        this.refreshRows() ;
        location.reload();
      }

    )
  }
  onStudentClick(idStudent: number) {
    console.log(idStudent);
  }
}

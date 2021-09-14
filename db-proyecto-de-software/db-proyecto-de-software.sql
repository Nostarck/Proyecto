CREATE DATABASE judges
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

CREATE EXTENSION pgcrypto;

CREATE TABLE tbl_user (
	id UUID PRIMARY KEY NOT null, 
	username VARCHAR(25) UNIQUE,
	email VARCHAR(50) UNIQUE,
	hash VARCHAR(150),
	created DATE NOT NULL,
	updated DATE,
	deleted DATE
);

CREATE TABLE tbl_tag (
	id UUID PRIMARY KEY NOT null,
	name VARCHAR(225),
	created DATE NOT NULL,
	updated DATE,
	deleted DATE
);

CREATE TABLE tbl_judge (
	ID UUID PRIMARY KEY NOT null,
	name VARCHAR(25),
	created DATE NOT NULL,
	updated DATE,
	deleted DATE
);

CREATE TABLE tbl_problem (
	ID UUID PRIMARY KEY NOT null,
	problemID VARCHAR(25),
	judgeID UUID,
	created DATE NOT NULL,
	updated DATE,
	CONSTRAINT fk_judge
		FOREIGN KEY(judgeID)
			REFERENCES tbl_judge(id)
);	

CREATE TABLE tbl_student (
	id UUID PRIMARY KEY NOT null,
	studentID varchar(20),
	name varchar(50),
	lastName varchar(50),
	created DATE NOT NULL,
	updated DATE,
	deleted DATE
);

CREATE TABLE tbl_group (
	id UUID PRIMARY KEY NOT null,
	name VARCHAR(255),
	created DATE NOT NULL,
	updated DATE,
	deleted DATE
);

CREATE TABLE tbl_user_student (
	userID UUID,
	studentID UUID,
		FOREIGN KEY (userID) 
			REFERENCES tbl_user(id),
		FOREIGN KEY (studentID) 
				REFERENCES tbl_student(id)
);

CREATE TABLE tbl_user_group (
	userID UUID,
	groupID UUID,
		FOREIGN KEY (userID) 
			REFERENCES tbl_user(id),
		FOREIGN KEY (groupID) 
				REFERENCES tbl_group(id)
);

CREATE TABLE tbl_student_problem (
	studentID UUID,
	problemID UUID,
		FOREIGN KEY (studentID) 
			REFERENCES tbl_student(id),
		FOREIGN KEY (problemID) 
				REFERENCES tbl_problem(id)
);

CREATE TABLE tbl_problem_tag (
	problemID UUID,
	tagID UUID,
		FOREIGN KEY (problemID) 
			REFERENCES tbl_problem(id),
		FOREIGN KEY (tagID) 
				REFERENCES tbl_tag(id)
);

CREATE TABLE tbl_user_problem (
	userID UUID,
	problemID UUID,
    comment VARCHAR,
		FOREIGN KEY (userID) 
			REFERENCES tbl_user(id),
		FOREIGN KEY (problemID) 
				REFERENCES tbl_problem(id)
);

CREATE TABLE tbl_user_tag (
	userID UUID,
	tagID UUID,
		FOREIGN KEY (userID) 
			REFERENCES tbl_user(id),
		FOREIGN KEY (tagID) 
				REFERENCES tbl_tag(id)
);

CREATE TABLE tbl_student_group (
	studentID UUID,
	groupID UUID,
		FOREIGN KEY (studentID) 
			REFERENCES tbl_student(id),
		FOREIGN KEY (groupID) 
				REFERENCES tbl_group(id)
);

CREATE TABLE tbl_student_judge_username (
	studentID UUID,
	judgeID UUID,
	username VARCHAR(255),
		FOREIGN KEY (studentID) 
			REFERENCES tbl_student(id),
		FOREIGN KEY (judgeID) 
				REFERENCES tbl_judge(id)
);

CREATE TABLE tbl_student_judge_id (
	studentID UUID,
	judgeID UUID,
	id VARCHAR(255),
		FOREIGN KEY (studentID) 
			REFERENCES tbl_student(id),
		FOREIGN KEY (judgeID) 
				REFERENCES tbl_judge(id)
);

CREATE TABLE tbl_student_error_log (
    id UUID PRIMARY KEY NOT null,
	userid UUID,
	studentid UUID,
	username VARCHAR(255),
    description VARCHAR 
);

-----------------------------------SPs---------------------------------------------
---------------------------------STUDENTS-----------------------------------------

CREATE OR REPLACE FUNCTION prc_get_students(user_id TEXT,groups TEXT)
	RETURNS TABLE (students_info JSON) AS
	$BODY$
	DECLARE
	groups_id UUID[] = string_to_array(groups,';');
	BEGIN
		IF array_length(groups_id, 1) > 0 THEN
			RETURN QUERY
			SELECT json_build_object('id',S.id,'studentId',S.studentid
							,'name',S.name,'lastName',S.lastname,'creationDate',S.created,'Groups',json_agg(G.name))
								FROM TBL_USER AS U INNER JOIN TBL_USER_STUDENT AS US ON U.id = UUID(user_id)
									INNER JOIN TBL_STUDENT_GROUP AS SG ON SG.studentid = US.studentid
										INNER JOIN TBL_STUDENT AS S ON S.id = US.studentid
											INNER JOIN TBL_GROUP AS G ON G.id = SG.groupid
												WHERE SG.groupid = ANY(groups_id) AND
													S.deleted IS NULL 
													GROUP BY S.id
														HAVING COUNT(SG.groupid) = ARRAY_LENGTH(groups_id,1);
														
		ELSE --NO FILTER BY GROUPS
			RETURN QUERY
				SELECT json_build_object('id',S.id,'studentId',S.studentid --SEPARAR NOMBRE
										,'name',S.name,'lastName',S.lastname,'creationDate',S.created,'Groups',json_agg(G.name))
											FROM TBL_USER AS U INNER JOIN TBL_USER_STUDENT AS US ON U.id = UUID(user_id)
													INNER JOIN TBL_STUDENT AS S ON S.id = US.studentid
														LEFT JOIN TBL_STUDENT_GROUP AS SG ON SG.studentid = US.studentid
														LEFT JOIN TBL_GROUP AS G ON G.id = SG.groupid
																	WHERE S.deleted IS NULL 
																	GROUP BY S.id; 
		END IF;															
	END
	$BODY$
	LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION prc_get_students_usernames(user_id TEXT,students_id TEXT)
	RETURNS TABLE (students_info JSON) AS
	$BODY$
	DECLARE
	students_ids UUID[] = string_to_array(students_id,';');
	BEGIN
			RETURN QUERY
			SELECT json_build_object('id',S.id,'usernames',json_object_agg(j.name,sj.username)) FROM TBL_STUDENT_JUDGE_USERNAME AS SJ 
				INNER JOIN TBL_STUDENT AS S ON S.id = SJ.studentid 
				INNER JOIN TBL_JUDGE AS J ON J.id = SJ.judgeid 
					WHERE S.id = ANY(students_ids) AND S.deleted IS NULL
													GROUP BY S.id;												
	END
	$BODY$
	LANGUAGE 'plpgsql';
	/*
	CREATE OR REPLACE FUNCTION prc_get_students_usernames(user_id TEXT,students_id TEXT)
	RETURNS TABLE (students_info JSON) AS
	$BODY$
	DECLARE
	students_ids UUID[] = string_to_array(students_id,';');
	BEGIN
			RETURN QUERY
			SELECT json_build_object('studentId',S.id,'usernames',json_object_agg(j.name,sj.username)) FROM TBL_STUDENT_JUDGE_USERNAME AS SJ 
				INNER JOIN TBL_STUDENT AS S ON S.id = SJ.studentid 
				INNER JOIN TBL_JUDGE AS J ON J.id = SJ.judgeid 
					WHERE S.id = ANY(students_ids) AND S.deleted IS NULL
													GROUP BY S.id;												
	END
	$BODY$
	LANGUAGE 'plpgsql';
	*/
	

	
CREATE OR REPLACE FUNCTION prc_get_students_judge(user_id TEXT, judge_name TEXT)
	RETURNS TABLE (students_judge JSON) AS
	$BODY$
	DECLARE
		judge_id UUID := (SELECT id FROM tbl_judge WHERE name = judge_name);
	BEGIN
		IF judge_name = 'UVA' THEN
			RETURN QUERY
			SELECT json_build_object('studentId',studentid,'studentUserID',id)
				FROM tbl_student_judge_id WHERE judgeid = judge_id;
		ELSE
			RETURN QUERY
			SELECT json_build_object('studentId',studentid,'studentUsername',username) 
				FROM tbl_student_judge_username WHERE judgeid = judge_id;			
		END IF;
	END;
	$BODY$
	LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION prc_update_student_problems(user_id TEXT,student_uuid TEXT,judge TEXT,problems TEXT)
	RETURNS VOID AS
	    $BODY$
		DECLARE 
		problems_ids TEXT[] = string_to_array(problems,';');
		problem_id TEXT;
		problem_uuid UUID; --- si es un nuevo problema;
		judge_id UUID := (SELECT id FROM tbl_judge WHERE name = judge);
      BEGIN
	  	FOREACH problem_id IN ARRAY problems_idS LOOP
			problem_uuid := (SELECT id  FROM tbl_problem WHERE problemid = problem_id AND judgeid = judge_id); 
			IF problem_uuid IS NOT NULL THEN --ya existe en la DB
				RAISE NOTICE 'UUID existe %', problem_uuid;
				IF NOT EXISTS(SELECT 1 FROM tbl_student AS S  ---ENTRA EN ESTE IF SI ES UN NUEVO PROBLEMA PARA CON ESTE ESTUDIANTE
							  INNER JOIN tbl_student_problem AS SP ON SP.studentid = UUID(student_uuid) 
							  	WHERE SP.problemid = problem_uuid) THEN
								RAISE NOTICE 'NO HA SIDO RESUELTO PREVIAMENTE POR EL ESTUDIANTE';
								INSERT INTO tbl_student_problem VALUES(UUID(student_uuid),problem_uuid);
				END IF;
			ELSE
				RAISE NOTICE 'UUID no existe%', problem_uuid;
				problem_uuid = gen_random_uuid();
				INSERT INTO tbl_problem VALUES(problem_uuid,problem_id,judge_id,CURRENT_DATE,CURRENT_DATE);
				INSERT INTO tbl_user_problem VALUES(UUID(user_id),problem_uuid);
								IF NOT EXISTS(SELECT 1 FROM tbl_student AS S  ---ENTRA EN ESTE IF SI ES UN NUEVO PROBLEMA PARA CON ESTE ESTUDIANTE
							  INNER JOIN tbl_student_problem AS SP ON S.id = UUID(student_uuid) 
							  	WHERE SP.problemid = problem_uuid) THEN
								INSERT INTO tbl_student_problem VALUES(UUID(student_uuid),problem_uuid);
				END IF;
			END IF;
		END LOOP;
      END;
    $BODY$
LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION prc_get_student_problem(user_id TEXT,student_uuid TEXT, tags TEXT)
	RETURNS TABLE (J JSON) AS
	$BODY$
		DECLARE
		tags_ids UUID[] = string_to_array(tags,';');
		tags_len INT = array_length(tags_ids,1);
		BEGIN
			IF EXISTS(SELECT 1 FROM tbl_student AS S INNER JOIN tbl_user_student AS US ON UUID(student_uuid) = US.studentid
					  WHERE US.userid = UUID(user_id) AND S.deleted IS NULL) THEN
				IF tags_len IS NULL THEN
					  RETURN QUERY
					  SELECT json_build_object('id',P.problemid,'Judge',J.name,'tags',json_agg(T.name)) FROM tbl_student AS S 
					  		INNER JOIN tbl_user_student AS US ON S.id = UUID(student_uuid) 
							INNER JOIN tbl_student_problem AS SP on US.studentid = SP.studentid
							INNER JOIN tbl_problem AS P ON P.id = SP.problemid
							INNER JOIN tbl_judge AS J ON J.id = P.judgeid 
							LEFT JOIN tbl_problem_tag AS PT ON PT.problemid = P.id
							LEFT JOIN TBL_TAG AS T ON T.id = PT.tagid
							WHERE S.deleted IS NULL AND US.userid = UUID(user_id) AND SP.studentid = UUID(student_uuid)
							GROUP BY P.problemid,J.name;
				ELSE
					RETURN QUERY
					  SELECT json_build_object('id',P.problemid,'Judge',J.name,'tags',json_agg(T.name)) FROM tbl_student AS S 
					  		INNER JOIN tbl_user_student AS US ON S.id = UUID(student_uuid) 
							INNER JOIN tbl_student_problem AS SP on US.studentid = SP.studentid
							INNER JOIN tbl_problem AS P ON P.id = SP.problemid
							INNER JOIN tbl_judge AS J ON J.id = P.judgeid 
							INNER JOIN tbl_problem_tag AS PT ON PT.problemid = P.id
							INNER JOIN TBL_TAG AS T ON T.id = PT.tagid
							WHERE T.id = ANY(tags_ids)
							AND S.deleted IS NULL AND US.userid = UUID(user_id) AND SP.studentid = UUID(student_uuid)
							GROUP BY P.problemid,J.name
							HAVING COUNT(T.id) = tags_len;
				END IF;
			END IF;
		END
	$BODY$
	LANGUAGE 'plpgsql';

-----------------------------PROBLEMS--------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prc_get_problems(user_id TEXT,judges TEXT,tags TEXT)
	RETURNS TABLE (J JSON) AS
	$BODY$
		DECLARE
		judges_ids UUID[] = string_to_array(judges,';');
		tags_ids UUID[] = string_to_array(tags,';');
		judges_len INT = array_length(judges_ids,1);
		tags_len INT = array_length(tags_ids,1);
		BEGIN
			raise notice 'tags %', tags_len;
			raise notice 'judges %', judges_len;
			IF judges_len IS NULL AND tags_len IS NULL THEN --NO FILTERS
				RAISE NOTICE 'no filters';
				RETURN QUERY
				SELECT json_build_object('UUID',P.id,'problemid',P.problemid,'judgeName',J.name,'tags',json_agg(T.name),'date',P.created,'comment',UP.comment) FROM TBL_PROBLEM AS P
					INNER JOIN TBL_USER_PROBLEM AS UP ON P.id = UP.problemid
					INNER JOIN TBL_JUDGE AS J ON J.id = P.judgeid
					LEFT JOIN TBL_PROBLEM_TAG AS PT ON PT.problemid = P.id
					LEFT JOIN TBL_TAG AS T ON T.id = PT.tagid
					WHERE UP.userid = UUID(user_id)
					GROUP BY P.id,J.name,P.created,UP.comment;
			END IF;
			IF judges_len IS NOT NULL AND tags_len IS NULL THEN -- ONLY JUDGES
			RAISE NOTICE 'filter judges';
				RETURN QUERY
					SELECT json_build_object('UUID',P.id,'problemid',P.problemid,'judgeName',J.name,'tags',json_agg(T.name),'date',P.created,'comment',UP.comment) FROM TBL_PROBLEM AS P
						INNER JOIN TBL_USER_PROBLEM AS UP ON P.id = UP.problemid
						INNER JOIN TBL_JUDGE AS J ON J.id = P.judgeid
						LEFT JOIN TBL_PROBLEM_TAG AS PT ON PT.problemid = P.id
						LEFT JOIN TBL_TAG AS T ON T.id = PT.tagid
							WHERE J.id = ANY(judges_ids) AND UP.userid = UUID(user_id)
							GROUP BY P.id,J.name,P.created,UP.comment;
			END IF;
			IF judges_len IS NULL AND tags_len IS NOT NULL THEN -- ONLY TAGS
			RAISE NOTICE 'filter tags';
				RETURN QUERY
					SELECT json_build_object('UUID',P.id,'problemid',P.problemid,'judgeName',J.name,'tags',json_agg(T.name),'date',P.created,'comment',UP.comment) FROM TBL_PROBLEM AS P
						INNER JOIN TBL_USER_PROBLEM AS UP ON P.id = UP.problemid
						INNER JOIN TBL_JUDGE AS J ON J.id = P.judgeid
						INNER JOIN TBL_PROBLEM_TAG AS PT ON PT.problemid = P.id
						INNER JOIN TBL_TAG AS T ON T.id = PT.tagid
							WHERE T.id = ANY(tags_ids) AND UP.userid = UUID(user_id)
							GROUP BY P.id,J.name,P.created,UP.comment
							HAVING COUNT(T.id) = tags_len;
			END IF;
			IF judges_len IS NOT NULL AND tags_len IS NOT NULL THEN -- BOTH
				RAISE NOTICE 'BOTH';
					RETURN QUERY
					SELECT json_build_object('UUID',P.id,'problemid',P.problemid,'judgeName',J.name,'tags',json_agg(T.name),'date',P.created,'comment',UP.comment) FROM TBL_PROBLEM AS P
						INNER JOIN TBL_USER_PROBLEM AS UP ON P.id = UP.problemid
						INNER JOIN TBL_JUDGE AS J ON J.id = P.judgeid
						INNER JOIN TBL_PROBLEM_TAG AS PT ON PT.problemid = P.id
						INNER JOIN TBL_TAG AS T ON T.id = PT.tagid
							WHERE T.id = ANY(tags_ids) AND J.id = ANY(judges_ids)
							AND UP.userid = UUID(user_id)
							GROUP BY P.id,J.name,P.created,UP.comment
							HAVING COUNT(T.id) = tags_len;
			END IF;
		END
	$BODY$
	LANGUAGE 'plpgsql';

----CORREGIDO COMENTARIO TABLA RESPECTIVA
CREATE OR REPLACE FUNCTION prc_update_problem(_user_id TEXT, _problemID TEXT, _comment TEXT)
    RETURNS VOID AS
        $BODY$
        DECLARE
            	BEGIN
   						IF EXISTS (SELECT 1 FROM tbl_user_problem WHERE userid = UUID(_user_id) AND problemid = UUID(_problemID)) THEN
							UPDATE TBL_PROBLEM
								SET updated = CURRENT_DATE
									WHERE id = UUID(_problemID);
								UPDATE TBL_USER_PROBLEM
								SET comment = _comment
									WHERE problemid = UUID(_problemID) AND userid = UUID(_user_id);
						END IF;
            	END;
        	$BODY$
    	LANGUAGE 'plpgsql';

---correcion 
CREATE OR REPLACE FUNCTION prc_add_tags_to_problems(_user_id TEXT, _tags TEXT, _problems TEXT)
    RETURNS VOID AS
        $BODY$
        DECLARE
			problems_id TEXT[] = string_to_array(_problems,';');
			tags_id TEXT[] = string_to_array(_tags,';');
			problem TEXT;
			tag TEXT;
            	BEGIN
                	FOREACH problem IN ARRAY problems_id LOOP
   						IF EXISTS (SELECT 1 FROM tbl_user_problem WHERE userid = UUID(_user_id) AND problemid = UUID(problem)) THEN
									raise notice 'problem: %', problem;
								   FOREACH tag IN ARRAY tags_id LOOP
								   		IF EXISTS (SELECT 1 FROM tbl_user_tag WHERE userid = UUID(_user_id) AND tagid = UUID(tag)) THEN
										raise notice 'PROBLEM ID: %', problem;
										raise notice 'TAG ID: %', tag;
											IF NOT EXISTS(SELECT 1 FROM tbl_problem_tag WHERE problemid = UUID(problem) AND tagid =UUID(tag)) THEN
													raise notice 'tag: %', tag;
													INSERT INTO tbl_problem_tag VALUES(UUID(problem),UUID(tag));
											END IF;
										END IF;
									END LOOP;
						END IF;
					END LOOP;
            	END;
        	$BODY$
    	LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION prc_delete_tags_from_problems(_user_id TEXT, _tags TEXT, _problems TEXT)
    RETURNS VOID AS
        $BODY$
        DECLARE
			problems_id TEXT[] = string_to_array(_problems,';');
			tags_id TEXT[] = string_to_array(_tags,';');
			problem TEXT;
			tag TEXT;
            	BEGIN
                	FOREACH problem IN ARRAY problems_id LOOP
						IF EXISTS(SELECT 1 FROM tbl_user_problem WHERE userid = UUID(_user_id) AND problemid = UUID(problem)) THEN
							FOREACH tag IN ARRAY tags_id LOOP
								IF EXISTS(SELECT 1 FROM tbl_user_tag WHERE userid = UUID(_user_id) AND tagid = UUID(tag)) THEN
									DELETE FROM tbl_problem_tag WHERE problemid = UUID(problem) AND tagid = UUID(tag);
									UPDATE tbl_problem
										SET updated = CURRENT_DATE
											WHERE id = UUID(problem);
								END IF;
							END LOOP;
						END IF;
					END LOOP;	
            	END;
        	$BODY$
    	LANGUAGE 'plpgsql';

-------------------------VENTANA DE ESTUDIANTES---------------------------------------------

---CORRECCIONES



CREATE OR REPLACE FUNCTION prc_add_student(userID TEXT, student_id TEXT, student_name TEXT ,
	student_last_name TEXT,student_judge_usernames TEXT, 
	student_judge_ids TEXT)
		RETURNS TABLE (ID UUID, STUDENTID varchar(20)) AS
        $BODY$
        DECLARE
			_id_ UUID = gen_random_uuid();
			student_usernames TEXT[] = string_to_array(student_judge_usernames,';');
			student_ids TEXT[] = string_to_array(student_judge_ids,';');
			judges_ids TEXT[] := (SELECT ARRAY(SELECT J.ID FROM TBL_JUDGE AS J));
			len INT = ARRAY_LENGTH(judges_ids,1); --use as iterator
			judge TEXT;
			username TEXT;
			id_user TEXT;
            	BEGIN
					--INSERT IN TBL_STUDENT
					INSERT INTO TBL_STUDENT
						VALUES(_id_,student_id,student_name,student_last_name,CURRENT_DATE,CURRENT_DATE);
					--INSERT IN TBL_USER_STUDENT
					INSERT INTO TBL_USER_STUDENT VALUES(UUID(userID),_id_);
					
					FOR i IN 1..len LOOP
						username = student_usernames[i];
						judge = judges_ids[i];
						id_user = student_ids[i];
						raise notice '%',judge;
						INSERT INTO tbl_student_judge_username VALUES(_id_,UUID(judge),username);
						INSERT INTO tbl_student_judge_id VALUES(_id_,UUID(judge),id_user);
					END LOOP;
					RETURN QUERY
						SELECT S.id,
						  S.studentid FROM tbl_student AS S WHERE S.id = _id_;
            	END;
        	$BODY$
    	LANGUAGE 'plpgsql';
    	
    	
CREATE OR REPLACE FUNCTION prc_delete_students(_userID TEXT, students_id TEXT)
	RETURNS VOID AS
	$BODY$
	DECLARE
		student_id TEXT;
		students_id_array TEXT[] = string_to_array(students_id,';');
		BEGIN
			FOREACH student_id IN ARRAY students_id_array LOOP
				IF EXISTS(SELECT 1 FROM tbl_user_student WHERE userID = UUID(_userID) AND studentid = UUID(student_id)) THEN
					UPDATE tbl_student
							SET deleted = CURRENT_DATE 
							WHERE id = UUID(student_id);
					DELETE FROM tbl_user_student WHERE userID = UUID(_userID) AND studentID = UUID(student_id);
					DELETE FROM tbl_student_judge_username WHERE studentid = UUID(student_id);
					DELETE FROM tbl_student_judge_id WHERE studentid = UUID(student_id);
				END IF;
			END LOOP;
	    END;
    $BODY$
    LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION prc_update_student(_userID TEXT, student_UUID TEXT
	,student_ID TEXT, student_name TEXT, student_last_name TEXT,
	student_judge_usernames TEXT, student_judge_ids TEXT)
	RETURNS VOID AS
	$BODY$
		DECLARE
		student_usernames TEXT[] = string_to_array(student_judge_usernames,';');
		student_ids TEXT[] = string_to_array(student_judge_ids,';');
		judges_id TEXT[] := (SELECT ARRAY(SELECT J.ID FROM TBL_JUDGE AS J));
		len INT = ARRAY_LENGTH(judges_id,1); --use as iterator
		_judge_id UUID;
		_username TEXT;
		_id TEXT; 
		BEGIN --- verificar si este estudiante pertenece al usuario
			IF EXISTS(SELECT 1 FROM tbl_user_student WHERE userID = UUID(_userID) AND studentid = UUID(student_UUID)) THEN
				UPDATE tbl_student
					SET studentid = student_ID,
						name = student_name,
						lastName = student_last_name,
						updated = CURRENT_DATE
							WHERE id = UUID(student_UUID);
				FOR i IN 1..len LOOP
					_judge_id = judges_id[i];
					_username = student_usernames[i];
					_id = student_ids[i]; --sigue el orden codeforces,codechef,UVA
					UPDATE tbl_student_judge_id
						SET id = _id
							WHERE studentid = UUID(student_UUID) AND judgeid = _judge_id;
					UPDATE tbl_student_judge_username
						SET username = _username
							WHERE studentid = UUID(student_UUID) AND judgeid = _judge_id;				
				END LOOP;
			END IF;		
		END;
	$BODY$
	LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION prc_add_students_to_groups(user_id TEXT,students_ids TEXT,groups_ids TEXT)
	RETURNS VOID AS
	$BODY$
	DECLARE
	groups_ids_array TEXT[] = string_to_array(groups_ids,';');
	students_ids_array TEXT[] = string_to_array(students_ids,';');
	group_id TEXT;
	student_id TEXT;
		BEGIN
			FOREACH group_id IN ARRAY groups_ids_array LOOP
				IF EXISTS (SELECT 1 FROM tbl_user_group WHERE userid = UUID(user_id) AND groupid = UUID(group_id)) THEN
					FOREACH student_id IN ARRAY students_ids_array LOOP
						IF EXISTS (SELECT 1 FROM tbl_user_student WHERE userid = UUID(user_id) AND studentid = UUID(student_id)) THEN
							IF NOT EXISTS(SELECT 1 FROM tbl_student_group WHERE studentid = UUID(student_id) AND groupid = UUID(group_id)) THEN
								INSERT INTO tbl_student_group VALUES(UUID(student_id),UUID(group_id));
							END IF;
						END IF;
					END LOOP;
				END IF;
			END LOOP;
		END;
    $BODY$
    LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION prc_delete_students_from_groups(user_id TEXT,students_ids TEXT,groups_ids TEXT)
	RETURNS VOID AS
	$BODY$
	DECLARE
	groups_ids_array TEXT[] = string_to_array(groups_ids,';');
	students_ids_array TEXT[] = string_to_array(students_ids,';');
	group_id TEXT;
	student_id TEXT;
		BEGIN
			FOREACH group_id IN ARRAY groups_ids_array LOOP
				IF EXISTS (SELECT 1 FROM tbl_user_group WHERE userid = UUID(user_id) AND groupid = UUID(group_id)) THEN
					FOREACH student_id IN ARRAY students_ids_array LOOP
						IF EXISTS (SELECT 1 FROM tbl_user_student WHERE userid = UUID(user_id) AND studentid = UUID(student_id)) THEN
							DELETE FROM tbl_student_group WHERE studentid = UUID(student_id) AND groupid = UUID(group_id);
						END IF;
					END LOOP;
				END IF;
			END LOOP;
		END;
    $BODY$
    LANGUAGE 'plpgsql';
   
CREATE OR REPLACE FUNCTION prc_get_student_info(user_id TEXT, student_id TEXT)
  	RETURNS TABLE (id UUID,
				  userid VARCHAR(20),
				  name VARCHAR(50),
				  lastname VARCHAR(50)
				  ) AS
    $BODY$
      BEGIN
	  	IF EXISTS(SELECT 1 FROM tbl_user_student AS US WHERE US.userID = UUID(user_ID) AND US.studentid = UUID(student_id)) THEN
			RETURN QUERY
			SELECT S.id, S.studentid, S.name, S.lastname 
				FROM tbl_student AS S WHERE S.id = UUID(student_id);
		END IF;
      END;
    $BODY$
LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION prc_get_student_usernames(user_id TEXT, student_id TEXT)
  	RETURNS JSON AS
    $BODY$
	DECLARE 
	usernames JSON;
      BEGIN
	  	IF EXISTS(SELECT 1 FROM tbl_user_student WHERE userID = UUID(user_ID) AND studentid = UUID(student_id)) THEN
			SELECT json_object_agg(j.name,sj.username) INTO usernames FROM TBL_STUDENT_JUDGE_USERNAME AS SJ 
				INNER JOIN TBL_STUDENT AS S ON S.id = SJ.studentid 
				INNER JOIN TBL_JUDGE AS J ON J.id = SJ.judgeid 
					WHERE S.id = UUID(student_id);
			RETURN usernames;
		END IF;
      END;
    $BODY$
LANGUAGE 'plpgsql';

----------Raquel-----------------------------------------------------
----------USER-------------------------------------------------------
CREATE OR REPLACE FUNCTION prc_register_user(_username TEXT, _email TEXT, _hash TEXT)
    RETURNS TABLE (ID UUID, username varchar(25)) AS

    $BODY$
        BEGIN
			INSERT INTO tbl_user(id, username, email, hash, created)
			VALUES (gen_random_uuid(), _username, _email, _hash, current_date);
			
            RETURN QUERY								 
				SELECT U.id, U.username
                FROM tbl_user as U
                WHERE U.username = _username;
        END;
    $BODY$
LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION prc_find_user_by_username(_username TEXT)
    RETURNS TABLE (ID UUID, username varchar(25), hash varchar(150)) AS

    $BODY$
        BEGIN
            RETURN QUERY
                SELECT U.id, U.username, U.hash
                FROM tbl_user as U
                WHERE U.username = _username;
        END;
    $BODY$
LANGUAGE 'plpgsql';


---------SPs TAG-----------------------------------------------------
CREATE OR REPLACE FUNCTION prc_add_tag(_user_id UUID,_tag_name TEXT)
    RETURNS TABLE (ID UUID, name varchar(225)) AS
    $$
	DECLARE 
    tag_id UUID = gen_random_uuid();
        BEGIN
			INSERT INTO tbl_tag(id, name, created, updated)
			VALUES (tag_id, _tag_name, current_date, current_date);
            
            INSERT INTO tbl_user_tag(userID, tagID)
            VALUES (_user_id, tag_id);
			
            RETURN QUERY								 
				SELECT T.id, T.name
                FROM tbl_tag as T
                WHERE T.id = tag_id;
        END;
    $$
LANGUAGE 'plpgsql';
 

CREATE OR REPLACE FUNCTION prc_delete_tags(_user_id TEXT,_tags_id TEXT)
    RETURNS VOID AS
        $BODY$
        DECLARE
          tag UUID;
          tags_id TEXT[] = string_to_array(_tags_id,';');
            BEGIN
                FOREACH tag IN ARRAY tags_id LOOP
                    IF EXISTS(SELECT 1 FROM tbl_user_tag WHERE userID = UUID(_user_id) AND tagID = tag) THEN

                        DELETE FROM tbl_user_tag
                        WHERE userID = UUID(_user_id) AND tagID = tag;

                        DELETE FROM tbl_problem_tag
                        WHERE tagID = tag;

                        UPDATE tbl_tag
                        SET deleted = current_date
                        WHERE id = tag;
                    END IF;
                END LOOP;
            END;
        $BODY$
    LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION prc_update_tag( _user_id TEXT,_tag_id TEXT, _tag_name TEXT)
    RETURNS VOID AS
        $BODY$
            BEGIN
			--si no existe en tabla intermedia es porque se elimino la  etiqueta
				IF EXISTS(SELECT 1 FROM tbl_user_tag WHERE userID = UUID(_user_id) AND tagID = UUID(_tag_id)) THEN

					UPDATE tbl_tag
					SET name = _tag_name, updated = current_date
					WHERE id = UUID(_tag_id);

				END IF;
            END;
        $BODY$
    LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION prc_get_tags(_user_id TEXT)
  RETURNS TABLE (ID UUID,
				name VARCHAR(225), created_date DATE
				) AS
    $BODY$
      BEGIN
		RETURN QUERY
   		SELECT t.id,
          t.name,
		  t.created
    	FROM tbl_tag AS T 
		INNER JOIN tbl_user_tag AS UT on T.id = UT.tagID
		WHERE T.deleted IS NULL and UT.userID = UUID(_user_id);
      END;
    $BODY$
LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION prc_get_tags_names(_user_id TEXT)
  RETURNS TABLE (ID UUID,
				name VARCHAR(225)) AS
    $BODY$
      BEGIN
		RETURN QUERY
   		SELECT t.id,
          t.name
    	FROM tbl_tag AS T 
		INNER JOIN tbl_user_tag AS UT on T.id = UT.tagID
		WHERE T.deleted IS NULL and UT.userID = UUID(_user_id);
      END;
    $BODY$
LANGUAGE 'plpgsql';


------------------SPs GROUP-------------------------------------

CREATE OR REPLACE FUNCTION prc_add_group(_user_id TEXT,_group_name TEXT)
    RETURNS TABLE (ID UUID, name varchar(225)) AS
    $$
	DECLARE 
    group_id UUID = gen_random_uuid();
        BEGIN
			INSERT INTO tbl_group(id, name, created, updated)
			VALUES (group_id, _group_name, current_date, current_date);
            
            INSERT INTO tbl_user_group(userID, groupID)
            VALUES (UUID(_user_id), group_id);
			
            RETURN QUERY								 
				SELECT G.id, G.name
                FROM tbl_group as G
                WHERE G.id = group_id;
        END;
    $$
LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION prc_delete_group(_user_id TEXT,_group_id TEXT)
    RETURNS VOID AS
        $BODY$
            BEGIN
				IF EXISTS(SELECT 1 FROM tbl_user_group WHERE userID = UUID(_user_id) AND groupID = UUID(_group_id)) THEN

					DELETE FROM tbl_student_group
					WHERE groupID = UUID(_group_id);
					
					DELETE FROM tbl_user_group
					WHERE userID = UUID(_user_id) AND groupID = UUID(_group_id);

					UPDATE tbl_group
					SET deleted = current_date
					WHERE id = UUID(_group_id);

				END IF;			
            END;
        $BODY$
    LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION prc_update_group(_user_id TEXT,_group_id TEXT, _group_name TEXT)
    RETURNS VOID AS
        $BODY$
            BEGIN
			--si no existe en tabla intermedia es porque se elimino el grupo
				IF EXISTS(SELECT 1 FROM tbl_user_group WHERE userID = UUID(_user_id) AND groupID = UUID(_group_id)) THEN

					UPDATE tbl_group
					SET name = _group_name, updated = current_date
					WHERE id = UUID(_group_id);

				END IF;
            END;
        $BODY$
    LANGUAGE 'plpgsql';
	

--retorna los grupos que tienen estudiantes con problemas etiquetados con las etiquetas entrantes
--si no hay etiquetas retorna todos los grupos
CREATE OR REPLACE FUNCTION prc_get_groups(_user_id TEXT,_tags_id TEXT)
  RETURNS TABLE (id UUID,
				 name VARCHAR(255)
				) AS
    $BODY$
	DECLARE
	tags_id UUID[] = string_to_array(_tags_id,';');
      BEGIN
	  	IF array_length(tags_id, 1) > 0 THEN
			RETURN QUERY
			SELECT G.id, G.name
			FROM tbl_group AS G
			INNER JOIN tbl_user_group AS UG on G.id = UG.groupID
			INNER JOIN tbl_student_group AS SG on G.id = SG.groupID
			INNER JOIN (
				SELECT S.id
				FROM tbl_student AS S
				INNER JOIN tbl_user_student AS US on S.id = US.studentID
				INNER JOIN tbl_student_problem AS SP on S.id = SP.studentID
				INNER JOIN tbl_problem AS P on P.id = SP.problemID
				INNER JOIN tbl_problem_tag AS PT on P.id = PT.problemID
				WHERE PT.tagID = ANY(tags_id) AND US.userID = UUID(_user_id) AND S.deleted IS NULL
				GROUP BY S.id
				) AS Students on SG.studentID = Students.id
			WHERE UG.userID = UUID(_user_id) AND G.deleted IS NULL
			GROUP BY G.id, G.name;
			
		ELSE
			RETURN QUERY
			SELECT G.id, G.name
			FROM tbl_group AS G
			INNER JOIN tbl_user_group AS UG on G.id = UG.groupID
			WHERE UG.userID = UUID(_user_id) AND G.deleted IS NULL;
		
		END IF;
      END;
    $BODY$
LANGUAGE 'plpgsql';


--retorna los estudiantes, con sus nombres de usuario y el grupo al que pertenecen
--filtrado por etiquetas entrantes, retorna los estudiantes que hayan resuelto problemas con las etiquetas entrantes
--si no hay etiquetas retorna todos los estudiantes
CREATE OR REPLACE FUNCTION prc_get_groups_students(_user_id TEXT,_tag_ids TEXT)
  RETURNS TABLE (groups_students JSON) AS 
    $BODY$
	DECLARE
	tag_ids UUID[] = string_to_array(_tag_ids,';');
      BEGIN
	  	IF array_length(tag_ids, 1) > 0 THEN
		RETURN QUERY
			SELECT to_json(Response) AS groups_students
			FROM(
				--get group and students
				SELECT G.id AS groupId, S.*, J.usernames
				FROM tbl_group AS G
				INNER JOIN tbl_user_group AS UG on G.id = UG.groupID
				INNER JOIN tbl_student_group AS SG on G.id = SG.groupID
				INNER JOIN (
					--get students
					SELECT S.id, S.studentId, S.name, S.lastname
					FROM tbl_student AS S
					INNER JOIN tbl_user_student AS US on S.id = US.studentID
					INNER JOIN tbl_student_problem AS SP on S.id = SP.studentID
					INNER JOIN tbl_problem AS P on P.id = SP.problemID
					INNER JOIN tbl_problem_tag AS PT on P.id = PT.problemID
					WHERE PT.tagID = ANY(tag_ids) AND US.userID = UUID(_user_id) AND S.deleted IS NULL
					GROUP BY S.id, S.studentId, S.name, S.lastname
					) AS S on SG.studentID = S.id
				INNER JOIN (
					
					SELECT json_object_agg(J.name, SJU.username) AS usernames, S.id 
					FROM tbl_student_judge_username AS SJU 
					INNER JOIN tbl_student AS S ON S.id = SJU.studentID 
					INNER JOIN tbl_judge AS J ON J.id = SJU.judgeID 
					WHERE S.deleted IS NULL
					GROUP BY S.id
				) AS J on J.id = S.id
				
				WHERE UG.userID = UUID(_user_id) AND G.deleted IS NULL
			) AS Response;
			
		ELSE
		RETURN QUERY
			SELECT to_json(Response) AS groups_students
			FROM(
				SELECT G.id AS groupID, S.id, S.studentId, S.name, S.lastname, J.usernames
				FROM tbl_group AS G
				INNER JOIN tbl_user_group AS UG on G.id = UG.groupID
				INNER JOIN tbl_student_group AS SG on G.id = SG.groupID
				INNER JOIN tbl_student AS S on SG.studentID = S.id
				INNER JOIN (
					
					SELECT json_object_agg(J.name, SJU.username) AS usernames, S.id 
					FROM tbl_student_judge_username AS SJU 
					INNER JOIN tbl_student AS S ON S.id = SJU.studentID 
					INNER JOIN tbl_judge AS J ON J.id = SJU.judgeID 
					WHERE S.deleted IS NULL
					GROUP BY S.id
				) AS J on J.id = S.id
				WHERE UG.userID = UUID(_user_id) AND G.deleted IS NULL
				AND S.deleted IS NULL
			) AS Response;
		END IF;
      END;
    $BODY$
LANGUAGE 'plpgsql';


--retorna los estudiantes de ungrupo determinado, con sus nombres de usuario 
--y el id del grupo al que pertenecen

CREATE OR REPLACE FUNCTION prc_get_group_students(_user_id TEXT, _group_id TEXT)
  RETURNS TABLE (group_students JSON) AS 
    $BODY$
      BEGIN
		RETURN QUERY
		SELECT to_json(Response) AS groups_students
		FROM(
			SELECT S.studentId, S.name, S.lastname, J.usernames
			FROM tbl_group AS G
			INNER JOIN tbl_user_group AS UG on G.id = UG.groupID
			INNER JOIN tbl_student_group AS SG on G.id = SG.groupID
			INNER JOIN tbl_student AS S on SG.studentID = S.id
			INNER JOIN (

				SELECT json_object_agg(J.name, SJU.username) AS usernames, S.id 
				FROM tbl_student_judge_username AS SJU 
				INNER JOIN tbl_student AS S ON S.id = SJU.studentID 
				INNER JOIN tbl_judge AS J ON J.id = SJU.judgeID 
				WHERE S.deleted IS NULL
				GROUP BY S.id
			) AS J on J.id = S.id

			WHERE UG.userID = UUID(_user_id) AND G.id = UUID(_group_id) 
			AND G.deleted IS NULL AND S.deleted IS NULL
		) AS Response;
      END;
    $BODY$
LANGUAGE 'plpgsql';



CREATE OR REPLACE FUNCTION prc_get_judges_names()
  RETURNS TABLE (ID UUID,
				name VARCHAR(225)) AS
    $BODY$
      BEGIN
		RETURN QUERY
   		SELECT J.id,
          J.name
    	FROM tbl_judge AS J;
      END;
    $BODY$
LANGUAGE 'plpgsql';



CREATE OR REPLACE FUNCTION prc_add_student_log(userid TEXT, studentid TEXT, username TEXT, descr TEXT)
    RETURNS VOID AS
        $BODY$
        BEGIN
            INSERT INTO tbl_student_error_log VALUES(gen_random_uuid(), UUID(userid), UUID(studentid), username, descr);
        END;
        $BODY$
    LANGUAGE 'plpgsql';

------------------------------Tables content-------------------------------------------------------------
--password: pass123
SELECT * from prc_register_user('usertest', 'test@test.com', '$2b$10$hyfKWZ6zXiWBhlQk1enA7uAeWkXkpop8evE4M/oeI4y5OIIEQsqWy');
insert into tbl_judge(id, name, created) values (gen_random_uuid(),'CodeForces', current_date);
insert into tbl_judge(id, name, created) values (gen_random_uuid(),'CodeChef', current_date);
insert into tbl_judge(id, name, created) values (gen_random_uuid(),'UVA', current_date);

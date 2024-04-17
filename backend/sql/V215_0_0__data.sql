
use pain;

create table legal_signup_questionnaire (
    id int primary key auto_increment,
    state varchar(10) unique,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into legal_signup_questionnaire (id,state) values (1,'FL');

create table legal_signup_questions (
    id int primary key auto_increment,
    legal_signup_questionnaire_id int,
    question varchar(255),
    question_type varchar(64),
    weight float not null default 1,
    active int not null default 1,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (legal_signup_questionnaire_id) REFERENCES legal_signup_questionnaire(id)
);


insert into legal_signup_questions(legal_signup_questionnaire_id,question,question_type,weight) values
(1,'Date of accident','DATETIME',0),
(1,'Have Car Insurance','CHECKBOX',5),
(1,'Did the police think you were at fault','CHECKBOX',-5),
(1,'Accident Report','Upload',0);

create table legal_signup_answers (
    id int primary key auto_increment,
    legal_signup_questions_id int,
    user_id int,
    answer mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (legal_signup_questions_id) REFERENCES legal_signup_questions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);



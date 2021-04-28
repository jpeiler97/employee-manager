const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const connection = mysql.createConnection({
	host: 'localhost',

	port: 3306,

	user: 'root',

	password: 'sunflower2',
	database: 'employee_DB'
});

connection.connect((err) => {
	if (err) throw err;
	initialPrompts();
});

const initialPrompts = () => {
	console.log('Welcome to the Employee Management System!\n');
	inquirer
		.prompt({
			name: 'choiceList',
			type: 'list',
			message: 'Please choose an option.',
			choices: [ 'Add data', 'View data', 'Update employees', 'Exit' ]
		})
		.then((choice) => {
			switch (choice.choiceList) {
				//Starts prompts for adding data
				case 'Add data':
					addDataPrompts();
					break;

				//Starts prompts for viewing data
				case 'View data':
					viewDataPrompts();
					break;

				//Starts prompts for updating data
				case 'Update employees':
					updateDataPrompts();
					break;

				//Exits prompts
				case 'Exit':
					connection.end();
					process.exit(1);
					break;

				default:
					console.log('Invalid choice.');
					break;
			}
		});
};

const addDataPrompts = () => {
	inquirer
		.prompt({
			name: 'addChoices',
			type: 'list',
			message: 'What would you like to add?',
			choices: [ 'Department', 'Role', 'Employee' ]
		})
		.then((choice) => {
			let userChoice = choice;
			switch (choice.addChoices) {
				case 'Department':
					break;
				case 'Role':
					break;
				case 'Employee':
					break;
			}
		});
};

const viewDataPrompts = () => {
	inquirer
		.prompt({
			name: 'viewChoices',
			type: 'list',
			message: 'What would you like to view?',
			choices: [ 'Department', 'Role', 'Employee' ]
		})
		.then((choice) => {
			switch (choice.viewChoices) {
				case 'Department': {
					const query = 'SELECT * FROM departments';
					connection.query(query, (err, res) => {
						if (err) throw err;
						res.forEach(({ id, name }) => console.log(`id: ${id} || name: ${name}`));
					});
					break;
				}
				case 'Role': {
					const query = 'SELECT * FROM roles';
					connection.query(query, (err, res) => {
						if (err) throw err;
						res.forEach(({ id, title, salary, department_id }) =>
							console.log(
								`id: ${id} || title: ${title} || salary: ${salary} || department_id: ${department_id}`
							)
						);
					});
					break;
				}
				case 'Employee': {
					const query = 'SELECT * FROM employees';
					connection.query(query, (err, res) => {
						if (err) throw err;
						res.forEach(({ id, first_name, last_name, role_id, manager_id }) =>
							console.log(
								`id: ${id} || name: ${first_name} ${last_name} || role_id: ${role_id} || manager_id: ${manager_id}`
							)
						);
					});
					break;
				}
			}
		});
};

const updateDataPrompts = () => {
	inquirer.prompt({});
};

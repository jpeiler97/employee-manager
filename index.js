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
					addDepartment();
					break;
				case 'Role':
					addRole();
					break;
				case 'Employee':
					addEmployee();
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
						initialPrompts();
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
						initialPrompts();
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
						initialPrompts();
					});
					break;
				}
			}
		});
};

const updateDataPrompts = () => {
	inquirer.prompt({});
};

const addDepartment = () => {
	inquirer
		.prompt({
			name: 'name',
			type: 'input',
			message: 'Please enter your new department name.'
		})
		.then((answer) => {
			const query = `INSERT INTO departments (name) VALUES ('${answer.name}')`;
			connection.query(query, (err, res) => {
				if (err) throw err;
				console.log(`Added department!`);
			});
			initialPrompts();
		});
};

const addRole = () => {
	let depChoices = [];
	const depQuery = 'SELECT * FROM departments';
	connection.query(depQuery, (err, res) => {
		if (err) throw err;
		res.forEach(({ name }) => depChoices.push(name));
	});
	inquirer
		.prompt([
			{
				name: 'title',
				type: 'input',
				message: 'Please enter your new role title.'
			},
			{
				name: 'salary',
				type: 'input',
				message: 'Please input your role salary.'
			},
			{
				name: 'departmentId',
				type: 'list',
				message: 'Please choose your department.',
				choices: depChoices
			}
		])
		.then((answer) => {
			const query = `INSERT INTO roles (title, department_id) VALUES ('${answer.name}, ${answer.department_id}')`;
			connection.query(query, (err, res) => {
				if (err) throw err;
				console.log(`Added role!`);
			});
			initialPrompts();
		});
};

const addEmployee = () => {
	let mgrChoices = [];
	let mgr = false;
	const mgrQuery = 'SELECT * FROM employees WHERE manager_id IS NULL';
	connection.query(mgrQuery, (err, res) => {
		if (err) throw err;
		res.forEach(({ first_name, last_name }) => mgrChoices.push(first_name + ' ' + last_name));
	});
	inquirer
		.prompt([
			{
				type: 'list',
				name: 'managerCheck',
				message: 'Is your new employee a manager?',
				choices: [ 'Yes', 'No' ]
			}
		])
		.then((data) => {
			if (data.managerCheck === 'Yes') {
				mgr = true;
			}
			inquirer
				.prompt([
					{
						name: 'firstName',
						type: 'input',
						message: "Please enter your employee's first name."
					},
					{
						name: 'lastName',
						type: 'input',
						message: "Please enter your employee's last name."
					},
					{
						name: 'managerId',
						type: 'list',
						message: 'Please choose your manager.',
						choices: mgrChoices,
						when: mgr === false
					}
				])
				.then((answer) => {
					const query = `INSERT INTO employees (title, department_id) VALUES ('${answer.name}, ${answer.department_id}')`;
					connection.query(query, (err, res) => {
						if (err) throw err;
						console.log(`Added role!`);
					});
					initialPrompts();
				});
		});
};

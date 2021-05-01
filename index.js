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
	console.log('Welcome to the Employee Management System!\n');
	initialPrompts();
});

const initialPrompts = () => {
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
			switch (choice.addChoices) {
				case 'Department': {
					addDepartment();
					break;
				}
				case 'Role': {
					addRole();

					break;
				}
				case 'Employee': {
					addEmployee();

					break;
				}
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
					let table = [];
					connection.query(query, (err, res) => {
						if (err) throw err;
						res.forEach(({ id, name }) => table.push({ id: id, name: name }));
						console.table(table);
						initialPrompts();
					});

					break;
				}
				case 'Role': {
					const query = 'SELECT * FROM roles';
					let table = [];
					connection.query(query, (err, res) => {
						if (err) throw err;
						res.forEach(({ id, title, salary, department_id }) => {
							table.push({ ID: id, Title: title, Salary: salary, Department: department_id });
						});
						console.table(table);
						initialPrompts();
					});

					break;
				}
				case 'Employee': {
					const query = 'SELECT * FROM employees INNER JOIN roles on employees.role_id = roles.id';
					let table = [];
					connection.query(query, (err, res) => {
						if (err) throw err;
						res.forEach(({ id, first_name, last_name, role_id, manager_id, title }) => {
							table.push({
								ID: id,
								'First Name': first_name,
								'Last Name': last_name,
								'Role ID': role_id,
								'Manager ID': manager_id || 'Manager',
								Title: title
							});
						});
						console.table(table);
						initialPrompts();
					});

					break;
				}
			}
		});
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
				initialPrompts();
			});
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
				name: 'department',
				type: 'list',
				message: 'Please choose your department.',
				choices: depChoices
			}
		])
		.then((answer) => {
			let query = `INSERT INTO roles (title, salary, department_id) VALUES ('${answer.title}', ${answer.salary}, `;
			query += `(SELECT departments.id FROM departments WHERE (departments.name = '${answer.department}')))`;
			connection.query(query, (err, res) => {
				if (err) throw err;
				console.log(`Added role!`);
				initialPrompts();
			});
		});
};

const addEmployee = () => {
	let query = `SELECT first_name, last_name, role_id, manager_id, roles.id, roles.title FROM employees `;
	query += `INNER JOIN roles on employees.role_id = roles.id`;
	connection.query(query, (err, res) => {
		if (err) throw err;
		let mgrChoices = [];
		let mgr = false;

		connection.query('SELECT * FROM employees WHERE manager_id IS NULL', (err, res) => {
			if (err) throw err;
			res.forEach(({ first_name, last_name }) => mgrChoices.push(first_name + ' ' + last_name));
		});

		let roleChoices = [];
		connection.query('SELECT * FROM roles ', (err, res) => {
			if (err) throw err;
			res.forEach(({ title }) => roleChoices.push(title));
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
							name: 'role',
							type: 'list',
							message: 'Please choose your role.',
							choices: roleChoices
						},
						{
							name: 'manager',
							type: 'list',
							message: 'Please choose your manager.',
							choices: mgrChoices,
							when: mgr === false
						}
					])
					.then((answer) => {
						connection.query(
							`SELECT employees.id FROM employees WHERE CONCAT(first_name,  ' ', last_name ) = '${answer.manager}'`,
							(err, res) => {
								let chosenRoleId;
								let chosenManagerId;
								if (err) throw err;
								res.forEach(({ id }) => (chosenManagerId = id));

								connection.query(
									`SELECT roles.id FROM roles WHERE roles.title = '${answer.role}'`,
									(err, res) => {
										if (err) throw err;
										res.forEach(({ id }) => (chosenRoleId = id));

										connection.query(
											'INSERT INTO employees SET ?',
											{
												first_name: answer.firstName,
												last_name: answer.lastName,
												role_id: chosenRoleId,
												manager_id: chosenManagerId || null
											},
											(err) => {
												if (err) throw err;
												console.log('Employee added!');
												initialPrompts();
											}
										);
									}
								);
							}
						);
					});
			});
	});
};

const updateDataPrompts = () => {
	let employeeChoices = [];
	connection.query('SELECT * FROM employees WHERE manager_id IS NOT NULL', (err, res) => {
		if (err) throw err;

		// res.forEach(({ first_name, last_name }) => employeeChoices.push(`${first_name} ${last_name}`));
		res.forEach((res) => {
			employeeChoices.push(res.first_name + ' ' + res.last_name);
		});
		inquirer
			.prompt([
				{
					name: 'empChoices',
					type: 'list',
					message: 'Which employee would you like to update?',
					choices: employeeChoices
				},
				{
					name: 'colChoices',
					type: 'list',
					message: 'What would you like to update?',
					choices: [ 'First Name', 'Last Name', 'Role' ]
				}
			])
			.then((answer) => {
				let wholeName = answer.empChoices;
				let empId;
				let roleChoices = [];
				connection.query(
					`SELECT id FROM employees WHERE CONCAT(first_name, ' ', last_name) = '${wholeName}'`,
					(err, res) => {
						if (err) throw err;
						res.forEach(({ id }) => (empId = id));
						connection.query(`SELECT * FROM roles`, (err, res) => {
							if (err) throw err;
							res.forEach(({ title }) => {
								roleChoices.push(title);
							});

							switch (answer.colChoices) {
								case 'First Name': {
									inquirer
										.prompt({
											name: 'firstName',
											type: 'input',
											message: 'Enter a new first name:'
										})
										.then((answer) => {
											connection.query(
												`UPDATE employees SET first_name = '${answer.firstName}' WHERE id = ${empId}`,
												(err, res) => {
													if (err) throw err;
													console.log('Employee updated!');
													initialPrompts();
												}
											);
										});
									break;
								}
								case 'Last Name': {
									inquirer
										.prompt({
											name: 'lastName',
											type: 'input',
											message: 'Enter a new last name:'
										})
										.then((answer) => {
											connection.query(
												`UPDATE employees SET last_name = '${answer.lastName}' WHERE id = ${empId}`,
												(err, res) => {
													if (err) throw err;
													console.log('Employee updated!');
													initialPrompts();
												}
											);
										});
									break;
								}
								case 'Role': {
									inquirer
										.prompt({
											name: 'role',
											type: 'list',
											message: 'Choose a new role:',
											choices: roleChoices
										})
										.then((answer) => {
											let role;
											connection.query(
												`SELECT * FROM roles WHERE roles.title = '${answer.role}'`,
												(err, res) => {
													if (err) throw err;
													res.forEach(({ id }) => (role = id));
													connection.query(
														`UPDATE employees SET role_id = ${role} WHERE id = '${empId}'`,
														(err, res) => {
															if (err) throw err;
															console.log('Employee updated!');
															initialPrompts();
														}
													);
												}
											);
										});
									break;
								}
							}
						});
					}
				);
			});
	});
};

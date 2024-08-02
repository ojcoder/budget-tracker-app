import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Table } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import './BudgetDashboard.css';

const BudgetDashboard = () => {
    const [categories, setCategories] = useState(['Dining', 'Entertainment', 'School']);
    const [expenses, setExpenses] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [merchant, setMerchant] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [graphHeight, setGraphHeight] = useState(300);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState({ field: '', order: '' });
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const storedExpenses = JSON.parse(localStorage.getItem('expenses'));
        if (storedExpenses) {
            setExpenses(storedExpenses.map(expense => ({
                ...expense,
                date: new Date(expense.date)
            })));
        }

        const handleResize = () => {
            const height = window.innerHeight * 0.5;
            setGraphHeight(height);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [expenses]);

    const addExpense = () => {
        const newExpense = { category, amount: parseFloat(amount), merchant, date: new Date(date) };
        setExpenses([...expenses, newExpense]);
        setAmount('');
        setMerchant('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const deleteExpense = (index) => {
        const updatedExpenses = [...expenses];
        updatedExpenses.splice(index, 1);
        setExpenses(updatedExpenses);
    };

    const editExpense = (index) => {
        setEditMode(true);
        setEditIndex(index);
        setCategory(expenses[index].category);
        setAmount(expenses[index].amount.toString());
        setMerchant(expenses[index].merchant || '');
        setDate(expenses[index].date ? new Date(expenses[index].date).toISOString().split('T')[0] : '');
    };

    const updateExpense = () => {
        const updatedExpenses = [...expenses];
        updatedExpenses[editIndex] = { category, amount: parseFloat(amount), merchant, date: new Date(date) };
        setExpenses(updatedExpenses);
        setEditMode(false);
        setEditIndex(null);
        setCategory(categories[0]);
        setAmount('');
        setMerchant('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditIndex(null);
        setCategory(categories[0]);
        setAmount('');
        setMerchant('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const addCategory = () => {
        setCategories([...categories, newCategory]);
        setNewCategory('');
    };

    const filteredExpensesByMonthYear = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() + 1 === selectedMonth && expenseDate.getFullYear() === selectedYear;
    });

    const monthlyExpenses = () => {
        return categories.map(category => {
            return filteredExpensesByMonthYear
                .filter(expense => expense.category === category)
                .reduce((acc, curr) => acc + curr.amount, 0);
        });
    };

    const pieData = {
        labels: categories,
        datasets: [{
            data: monthlyExpenses(),
            backgroundColor: ['red', 'blue', 'green', 'orange', 'purple']
        }]
    };

    const pieOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        const dataset = tooltipItem.dataset;
                        const index = tooltipItem.dataIndex;
                        const currentValue = dataset.data[index];
                        const categoryLabel = pieData.labels[index];
                        return `${categoryLabel}: $${currentValue.toFixed(2)}`;
                    }
                }
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSortChange = (field) => {
        let order = 'asc';
        if (sortOption.field === field && sortOption.order === 'asc') {
            order = 'desc';
        }
        setSortOption({ field, order });
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const filteredExpenses = filteredExpensesByMonthYear.filter(expense => {
        return expense.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || 
               (expense.date && new Date(expense.date).toLocaleDateString().includes(searchQuery));
    });

    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        if (sortOption.field) {
            if (sortOption.field === 'amount') {
                return sortOption.order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            } else if (sortOption.field === 'date') {
                return sortOption.order === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
            }
        }
        return 0;
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value, 10));
    };

    const handleYearChange = (e) => {
        setSelectedYear(parseInt(e.target.value, 10));
    };

    const isFormValid = () => {
        return amount && merchant && date;
    };

    return (
        <Container>
            <h1 className="my-4 text-center">Expense Tracker</h1>
            <Row>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>{editMode ? 'Edit Expense' : 'Add Expense'}</Card.Title>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control as="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        {categories.map(cat => <option key={cat}>{cat}</option>)}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group className="mt-2">
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control type="text" pattern="\d*\.?\d*" value={amount} onChange={handleAmountChange} />
                                    <Form.Text className="text-muted">
                                        Enter a numerical value (e.g., 100.50)
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group className="mt-2">
                                    <Form.Label>Merchant</Form.Label>
                                    <Form.Control type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)} />
                                </Form.Group>
                                <Form.Group className="mt-2">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} />
                                </Form.Group>
                                {editMode ? (
                                    <div>
                                        <Button className="mt-3 me-2" onClick={updateExpense} disabled={!isFormValid()}>Update</Button>
                                        <Button className="mt-3" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                                    </div>
                                ) : (
                                    <Button className="mt-3" onClick={addExpense} disabled={!isFormValid()}>Add Expense</Button>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>
                    <Card className="mt-4">
                        <Card.Body>
                            <Card.Title>Add Category</Card.Title>
                            <Form>
                                <Form.Group>
                                    <Form.Label>New Category</Form.Label>
                                    <Form.Control type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                                </Form.Group>
                                <Button className="mt-3" onClick={addCategory}>Add Category</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8} className="mb-4">
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Monthly Expense Distribution</Card.Title>
                            <Form inline className="mb-3">
                                <Form.Group>
                                    <Form.Label>Month</Form.Label>
                                    <Form.Control as="select" value={selectedMonth} onChange={handleMonthChange} className="mx-2">
                                        {[...Array(12).keys()].map(i => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Year</Form.Label>
                                    <Form.Control as="select" value={selectedYear} onChange={handleYearChange} className="mx-2">
                                        {Array.from(new Array(10), (v, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
                                <div style={{ width: '60%' }}>
                                    <Pie data={pieData} options={pieOptions} />
                                </div>
                                <div style={{ width: '40%' }}>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>Category</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map((cat, index) => (
                                                <tr key={cat}>
                                                    <td>{cat}</td>
                                                    <td>${monthlyExpenses()[index].toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Body>
                            <Card.Title>Expense Details</Card.Title>
                            <Form onSubmit={handleSearchSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by Date or Merchant"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                </Form.Group>
                            </Form>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th onClick={() => handleSortChange('date')}>
                                            Date{' '}
                                            {sortOption.field === 'date' && (
                                                sortOption.order === 'asc' ? <FaSortUp /> : <FaSortDown />
                                            )}
                                        </th>
                                        <th>Merchant</th>
                                        <th>Category</th>
                                        <th onClick={() => handleSortChange('amount')}>
                                            Amount{' '}
                                            {sortOption.field === 'amount' && (
                                                sortOption.order === 'asc' ? <FaSortUp /> : <FaSortDown />
                                            )}
                                        </th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedExpenses.map((expense, index) => (
                                        <tr key={index}>
                                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                                            <td>{expense.merchant}</td>
                                            <td>{expense.category}</td>
                                            <td>${expense.amount.toFixed(2)}</td>
                                            <td>
                                                <Button variant="info" onClick={() => editExpense(index)}>Edit</Button>{' '}
                                                <Button variant="danger" onClick={() => deleteExpense(index)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BudgetDashboard;

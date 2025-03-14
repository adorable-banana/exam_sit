// 数据存储对象
const classData = {
    // 数据结构示例:
    // "初一信": {
    //     students: [
    //         { id: 1, name: "学生1", status: "present" }, // absent, present, personal-leave, official-leave
    //         ...
    //     ]
    // }
};

// 检查本地存储中是否有数据
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('classData');
    if (savedData) {
        Object.assign(classData, JSON.parse(savedData));
    }
}

// 保存数据到本地存储
function saveDataToLocalStorage() {
    localStorage.setItem('classData', JSON.stringify(classData));
}

// 检查班级数据是否存在
function hasClassData(grade, className) {
    const key = `${grade}${className}`;
    return classData[key] && classData[key].students && classData[key].students.length > 0;
}

// 获取班级数据
function getClassData(grade, className) {
    const key = `${grade}${className}`;
    return classData[key] || null;
}

// 保存班级数据
function saveClassData(grade, className, students) {
    const key = `${grade}${className}`;
    classData[key] = {
        students: students
    };
    saveDataToLocalStorage();
}

// 更新学生状态
function updateStudentStatus(grade, className, studentId, status) {
    const key = `${grade}${className}`;
    if (classData[key] && classData[key].students) {
        const student = classData[key].students.find(s => s.id === studentId);
        if (student) {
            student.status = status;
            saveDataToLocalStorage();
            return true;
        }
    }
    return false;
}

// 从Excel数据创建学生数组
function createStudentsFromExcel(excelData) {
    // 假设Excel数据是一个二维数组，每行代表一个学生
    // 第一列是学号，第二列是姓名
    const students = [];
    
    for (let i = 0; i < excelData.length; i++) {
        if (excelData[i] && excelData[i].length >= 2) {
            students.push({
                id: i + 1, // 确保ID是唯一的数字
                name: excelData[i][1] || `学生${i + 1}`,
                status: 'present' // 默认为在校（绿色）
            });
        }
    }
    
    // 确保至少有42个学生
    while (students.length < 42) {
        students.push({
            id: students.length + 1,
            name: `学生${students.length + 1}`,
            status: 'present'
        });
    }
    
    return students;
}

// 获取出席统计
function getAttendanceStats(grade, className) {
    const key = `${grade}${className}`;
    const stats = {
        present: 0,
        absent: 0,
        personalLeave: 0,
        officialLeave: 0
    };
    
    if (classData[key] && classData[key].students) {
        classData[key].students.forEach(student => {
            switch (student.status) {
                case 'present':
                    stats.present++;
                    break;
                case 'absent':
                    stats.absent++;
                    break;
                case 'personal-leave':
                    stats.personalLeave++;
                    break;
                case 'official-leave':
                    stats.officialLeave++;
                    break;
            }
        });
    }
    
    return stats;
}

// 初始化时加载数据
loadDataFromLocalStorage(); 
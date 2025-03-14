// 全局变量
let currentGrade = '';
let currentClass = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 绑定班级按钮点击事件
    const classButtons = document.querySelectorAll('.class-btn');
    classButtons.forEach(button => {
        button.addEventListener('click', function() {
            const grade = this.getAttribute('data-grade');
            const className = this.getAttribute('data-class');
            selectClass(grade, className);
            toggleMenu(); // 选择后关闭菜单
        });
    });

    // 绑定上传按钮点击事件
    document.getElementById('upload-btn').addEventListener('click', handleFileUpload);

    // 绑定保存按钮点击事件
    document.getElementById('save-btn').addEventListener('click', saveAttendance);
});

// 切换菜单显示/隐藏
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// 选择班级
function selectClass(grade, className) {
    currentGrade = grade;
    currentClass = className;
    
    // 更新标题
    document.getElementById('class-title').textContent = `${grade}${className}班座位表`;
    
    // 检查是否有该班级的数据
    if (hasClassData(grade, className)) {
        showSeatingChart(grade, className);
    } else {
        showUploadForm();
    }
}

// 显示上传表单
function showUploadForm() {
    document.getElementById('initial-message').style.display = 'none';
    document.getElementById('upload-container').style.display = 'block';
    document.getElementById('seating-chart-container').style.display = 'none';
}

// 显示座位表
function showSeatingChart(grade, className) {
    document.getElementById('initial-message').style.display = 'none';
    document.getElementById('upload-container').style.display = 'none';
    document.getElementById('seating-chart-container').style.display = 'block';
    
    renderSeatingChart(grade, className);
}

// 渲染座位表
function renderSeatingChart(grade, className) {
    const seatingChartElement = document.getElementById('seating-chart');
    seatingChartElement.innerHTML = '';
    
    const classData = getClassData(grade, className);
    if (!classData || !classData.students) return;
    
    // 创建42个座位
    for (let i = 0; i < 42; i++) {
        const student = i < classData.students.length ? classData.students[i] : null;
        
        const seatElement = document.createElement('div');
        seatElement.className = 'seat';
        
        if (student) {
            seatElement.innerHTML = `
                <div class="seat-number">${i + 1}</div>
                <div class="student-name">${student.name}</div>
            `;
            
            // 设置座位状态
            if (student.status === 'present') {
                seatElement.classList.add('present');
            } else if (student.status === 'personal-leave') {
                seatElement.classList.add('personal-leave');
            } else if (student.status === 'official-leave') {
                seatElement.classList.add('official-leave');
            }
            
            // 添加点击事件切换出席状态
            seatElement.setAttribute('data-student-id', student.id);
            seatElement.addEventListener('click', function() {
                toggleAttendance(this, student.id);
            });
        } else {
            seatElement.innerHTML = `
                <div class="seat-number">${i + 1}</div>
                <div class="student-name">空座</div>
            `;
            seatElement.classList.add('empty');
        }
        
        seatingChartElement.appendChild(seatElement);
    }
}

// 切换出席状态
function toggleAttendance(seatElement, studentId) {
    // 移除所有状态类
    seatElement.classList.remove('present', 'personal-leave', 'official-leave');
    
    // 获取当前状态
    let newStatus = 'absent';
    if (seatElement.classList.contains('absent') || !seatElement.classList.contains('present')) {
        seatElement.classList.add('present');
        newStatus = 'present';
    }
    
    // 更新数据
    updateStudentStatus(currentGrade, currentClass, studentId, newStatus);
}

// 处理文件上传
function handleFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请选择一个Excel文件');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 假设第一个工作表包含学生数据
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 将工作表转换为数组
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // 创建学生数组
        const students = createStudentsFromExcel(excelData);
        
        // 保存数据
        saveClassData(currentGrade, currentClass, students);
        
        // 显示座位表
        showSeatingChart(currentGrade, currentClass);
    };
    
    reader.readAsArrayBuffer(file);
}

// 保存出席情况
function saveAttendance() {
    saveDataToLocalStorage();
    alert('出席情况已保存');
} 
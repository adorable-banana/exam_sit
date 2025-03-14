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
        showNoDataMessage();
    }
}

// 显示无数据消息
function showNoDataMessage() {
    document.getElementById('initial-message').style.display = 'none';
    document.getElementById('no-data-message').style.display = 'block';
    document.getElementById('seating-chart-container').style.display = 'none';
}

// 显示座位表
function showSeatingChart(grade, className) {
    document.getElementById('initial-message').style.display = 'none';
    document.getElementById('no-data-message').style.display = 'none';
    document.getElementById('seating-chart-container').style.display = 'block';
    
    renderSeatingChart(grade, className);
    updateAttendanceSummary(grade, className);
}

// 渲染座位表
function renderSeatingChart(grade, className) {
    const seatingChartElement = document.getElementById('seating-chart');
    seatingChartElement.innerHTML = '';
    
    const classData = getClassData(grade, className);
    if (!classData || !classData.students) return;
    
    console.log('主任页面渲染座位表:', classData); // 调试信息
    
    // 创建42个座位
    for (let i = 0; i < 42; i++) {
        const student = i < classData.students.length ? classData.students[i] : null;
        
        const seatElement = document.createElement('div');
        seatElement.className = 'seat';
        
        if (student) {
            console.log(`学生 ${i+1}:`, student.name, student.status, student.id); // 调试信息
            
            // 设置座位状态
            if (student.status === 'present') {
                seatElement.classList.add('present');
                seatElement.innerHTML = `
                    <div class="seat-number">${i + 1}</div>
                    <div class="student-name">${student.name}</div>
                `;
            } else if (student.status === 'personal-leave') {
                seatElement.classList.add('personal-leave');
                seatElement.innerHTML = `
                    <div class="seat-number">${i + 1}</div>
                    <div class="student-name">${student.name}</div>
                `;
            } else if (student.status === 'official-leave') {
                seatElement.classList.add('official-leave');
                seatElement.innerHTML = `
                    <div class="seat-number">${i + 1}</div>
                    <div class="student-name">${student.name}</div>
                `;
            } else {
                // 缺席状态，添加请假按钮
                seatElement.innerHTML = `
                    <div class="seat-number">${i + 1}</div>
                    <div class="student-name">${student.name}</div>
                    <div class="leave-buttons">
                        <button class="leave-btn personal-leave-btn" data-student-id="${student.id}" data-leave-type="personal-leave">事假</button>
                        <button class="leave-btn official-leave-btn" data-student-id="${student.id}" data-leave-type="official-leave">工假</button>
                    </div>
                `;
                
                // 绑定请假按钮点击事件
                seatElement.querySelectorAll('.leave-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation(); // 阻止事件冒泡
                        const studentId = parseInt(this.getAttribute('data-student-id'));
                        const leaveType = this.getAttribute('data-leave-type');
                        markLeave(studentId, leaveType);
                    });
                });
            }
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

// 标记请假
function markLeave(studentId, leaveType) {
    console.log('标记请假:', studentId, leaveType); // 调试信息
    
    // 获取当前学生数据
    const classData = getClassData(currentGrade, currentClass);
    if (!classData || !classData.students) {
        console.error('找不到班级数据');
        return false;
    }
    
    // 查找学生
    const student = classData.students.find(s => s.id === studentId);
    if (!student) {
        console.error('找不到学生:', studentId);
        return false;
    }
    
    console.log('学生信息:', student);
    
    // 更新学生状态
    student.status = leaveType;
    
    // 保存数据
    saveDataToLocalStorage();
    
    // 重新渲染座位表
    renderSeatingChart(currentGrade, currentClass);
    
    // 更新出席统计
    updateAttendanceSummary(currentGrade, currentClass);
    
    return true;
}

// 更新出席统计
function updateAttendanceSummary(grade, className) {
    const stats = getAttendanceStats(grade, className);
    
    document.getElementById('present-count').textContent = stats.present;
    document.getElementById('absent-count').textContent = stats.absent;
    document.getElementById('personal-leave-count').textContent = stats.personalLeave;
    document.getElementById('official-leave-count').textContent = stats.officialLeave;
} 
# GitHub Pages 配置指南

## 问题诊断

GitHub Pages返回404错误，原因是GitHub Pages需要在仓库设置中手动启用。

## 解决方案

请按照以下步骤手动配置GitHub Pages：

### 方法一：使用GitHub Actions（推荐）

1. **访问仓库设置**
   - 打开仓库：https://github.com/qicheng07/simple-calculator
   - 点击 **Settings**（设置）选项卡

2. **配置GitHub Pages**
   - 在左侧菜单中找到 **Pages**
   - 在 **Build and deployment** 部分：
     - **Source**: 选择 "GitHub Actions"

3. **等待部署**
   - GitHub Actions会自动检测 `.github/workflows/deploy.yml` 文件
   - 等待workflow运行完成（通常需要1-2分钟）
   - 部署完成后，访问 https://qicheng07.github.io/simple-calculator/

### 方法二：手动部署

1. **访问仓库设置**
   - 打开仓库：https://github.com/qicheng07/simple-calculator
   - 点击 **Settings**（设置）选项卡

2. **配置GitHub Pages**
   - 在左侧菜单中找到 **Pages**
   - 在 **Build and deployment** 部分：
     - **Source**: 选择 "Deploy from a branch"
     - **Branch**: 选择 `main` 分支，`/ (root)` 文件夹
   - 点击 **Save**

3. **等待部署**
   - 等待几分钟后刷新页面
   - 访问 https://qicheng07.github.io/simple-calculator/

## 验证部署

部署成功后，应该能看到计算器页面。

## 常见问题

### Q: workflow没有自动运行？
A: 检查workflow文件是否在 `.github/workflows/` 目录下，并确保文件名以 `.yml` 或 `.yaml` 结尾。

### Q: 部署成功但页面仍然是404？
A: 等待5-10分钟后重试，GitHub Pages需要时间来完成初始配置。

### Q: 如何查看部署状态？
A: 访问仓库的 **Actions** 标签页，查看workflow运行状态。

## 技术支持

如果问题仍然存在，请检查：
1. 仓库是否为Public（公开）仓库
2. workflow文件格式是否正确
3. 分支名称是否正确（main而非master）
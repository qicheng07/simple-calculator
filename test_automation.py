"""
多功能工具箱 Web 应用 - 自动化测试脚本
使用 browser-use 进行功能验证测试
"""

import asyncio
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from browser_use import Agent, Browser, ChatBrowserUse


async def test_calculator():
    """测试计算器功能"""
    print("\n=== 测试计算器功能 ===")

    browser = Browser()
    agent = Agent(
        task="""
        打开本地文件 c:/Users/Administrator/Desktop/新建文件夹/index.html

        测试计算器功能:
        1. 点击数字按钮 "5"
        2. 点击运算符 "+"
        3. 点击数字按钮 "3"
        4. 点击 "=" 按钮
        5. 验证结果显示为 "8"

        截图保存为 calculator_test.png
        """,
        llm=ChatBrowserUse(),
        browser=browser,
    )

    await agent.run()
    await browser.close()


async def test_todo():
    """测试待办清单功能"""
    print("\n=== 测试待办清单功能 ===")

    browser = Browser()
    agent = Agent(
        task="""
        打开本地文件 c:/Users/Administrator/Desktop/新建文件夹/index.html

        测试待办清单功能:
        1. 点击 "待办清单" Tab
        2. 在输入框中输入 "测试任务1"
        3. 选择 "高优先级"
        4. 点击 "添加" 按钮
        5. 验证任务添加成功，显示红色"高"标签

        截图保存为 todo_test.png
        """,
        llm=ChatBrowserUse(),
        browser=browser,
    )

    await agent.run()
    await browser.close()


async def test_password_generator():
    """测试密码生成器功能"""
    print("\n=== 测试密码生成器功能 ===")

    browser = Browser()
    agent = Agent(
        task="""
        打开本地文件 c:/Users/Administrator/Desktop/新建文件夹/index.html

        测试密码生成器功能:
        1. 点击 "密码生成器" Tab
        2. 设置密码长度为 16
        3. 确保所有字符类型都已勾选
        4. 点击 "生成密码" 按钮
        5. 验证密码生成成功，显示强度指示

        截图保存为 password_test.png
        """,
        llm=ChatBrowserUse(),
        browser=browser,
    )

    await agent.run()
    await browser.close()


async def test_theme_switch():
    """测试主题切换功能"""
    print("\n=== 测试主题切换功能 ===")

    browser = Browser()
    agent = Agent(
        task="""
        打开本地文件 c:/Users/Administrator/Desktop/新建文件夹/index.html

        测试主题切换功能:
        1. 点击主题切换按钮（月亮图标）
        2. 验证页面切换到深色主题
        3. 再次点击主题切换按钮（太阳图标）
        4. 验证页面切换回浅色主题

        截图保存为 theme_test.png
        """,
        llm=ChatBrowserUse(),
        browser=browser,
    )

    await agent.run()
    await browser.close()


async def test_navigation():
    """测试导航切换功能"""
    print("\n=== 测试导航切换功能 ===")

    browser = Browser()
    agent = Agent(
        task="""
        打开本地文件 c:/Users/Administrator/Desktop/新建文件夹/index.html

        测试导航切换功能:
        1. 点击 "计算器" Tab，验证页面显示计算器
        2. 点击 "待办清单" Tab，验证页面显示待办清单
        3. 点击 "密码生成器" Tab，验证页面显示密码生成器
        4. 点击 "关于我" Tab，验证页面显示关于我内容

        截图保存为 navigation_test.png
        """,
        llm=ChatBrowserUse(),
        browser=browser,
    )

    await agent.run()
    await browser.close()


async def main():
    """运行所有测试"""
    print("\n" + "="*60)
    print("多功能工具箱 Web 应用 - 自动化功能测试")
    print("="*60)

    try:
        # 测试计算器
        await test_calculator()

        # 测试待办清单
        await test_todo()

        # 测试密码生成器
        await test_password_generator()

        # 测试主题切换
        await test_theme_switch()

        # 测试导航切换
        await test_navigation()

        print("\n" + "="*60)
        print("所有测试完成！")
        print("="*60)

    except Exception as e:
        print(f"\n测试执行出错: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())

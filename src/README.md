scale
手动控制的缩放比 = 1 时，就是 pdf 实际尺寸
自适应时，通过容器宽度 / pdf 实际宽度，动态计算 scale

--scale-factor 页面缩放比
scale \* PixelsPerInch.PDF_TO_CSS_UNITS


点击放大 => 根据 scale 计算 nextScale

setScale 参数可能是数字或缩放类型

setScaleUpdatePages 设置 scale、scaleValue
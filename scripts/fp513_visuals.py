#!/usr/bin/env python3
"""Generate the FP513 reader's original SVG diagrams -> content/fp513/visuals.json.
Coordinates are computed (bond prices, duration tangent, option payoffs, two-asset frontier),
so the pictures match the formulas. Run: python3 scripts/fp513_visuals.py"""
import math, json
def bond(c,y,n=20): return sum(c*1000/(1+y)**t for t in range(1,n+1))+1000/(1+y)**n
W,H=520,300; L,R,T,B=48,500,20,262
def X(v,a,b): return L+(v-a)/(b-a)*(R-L)
def Y(v,a,b): return B-(v-a)/(b-a)*(B-T)
def axes(xl,yl):
    return (f'<line x1="{L}" y1="{B}" x2="{R}" y2="{B}" stroke="currentColor"/><line x1="{L}" y1="{T}" x2="{L}" y2="{B}" stroke="currentColor"/>'
            f'<text x="{(L+R)/2}" y="{H-8}" text-anchor="middle" font-size="12" fill="currentColor">{xl}</text>'
            f'<text x="14" y="{(T+B)/2}" text-anchor="middle" font-size="12" fill="currentColor" transform="rotate(-90 14 {(T+B)/2})">{yl}</text>')
out={}
ys=[i/1000 for i in range(20,121,2)]; ps=[bond(0.06,y) for y in ys]; pa,pb=300,2000
curve=' '.join(f'{X(y,0.02,0.12):.1f},{Y(p,pa,pb):.1f}' for y,p in zip(ys,ps))
y0=0.06; p0=bond(0.06,y0)
D=(sum(t*60/(1+y0)**t for t in range(1,21))+20*1000/(1+y0)**20)/p0
slope=-D*p0/(1+y0)
tan=' '.join(f'{X(y,0.02,0.12):.1f},{Y(p0+slope*(y-y0),pa,pb):.1f}' for y in [0.03,0.09])
out['convexity']=(f'<svg class="fp5-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Price-yield curve of a 20-year 6% bond: the curve bows above the straight duration line">'+axes('Market yield (2% → 12%)','Bond price')+
 f'<polyline fill="none" stroke="#2563eb" stroke-width="3" points="{curve}"/><polyline fill="none" stroke="#e11d48" stroke-width="2" stroke-dasharray="6 5" points="{tan}"/>'
 f'<circle cx="{X(y0,0.02,0.12):.1f}" cy="{Y(p0,pa,pb):.1f}" r="5" fill="currentColor"/>'
 f'<text x="{X(0.085,0.02,0.12):.0f}" y="{Y(900,pa,pb):.0f}" font-size="12" fill="#2563eb">actual price (convex)</text>'
 f'<text x="{X(0.031,0.02,0.12):.0f}" y="{Y(1820,pa,pb):.0f}" font-size="12" fill="#e11d48">duration estimate (straight line)</text>'
 f'<text x="{X(0.062,0.02,0.12):.0f}" y="{Y(p0,pa,pb)-10:.0f}" font-size="12" fill="currentColor">par at 6%</text></svg>')
def pay(kind,side,S,K=50,pr=4):
    iv=max(0,S-K) if kind=='call' else max(0,K-S); v=iv-pr; return v if side=='long' else -v
def mini(title,f,color,be,note):
    w,h=250,170; l,r,t,b=30,240,22,140
    Ss=list(range(20,81)); vals=[f(s) for s in Ss]; lo,hi=-40,40
    xx=lambda s:l+(s-20)/60*(r-l); yy=lambda v:b-(v-lo)/(hi-lo)*(b-t)
    pts=' '.join(f'{xx(s):.1f},{yy(max(lo,min(hi,v))):.1f}' for s,v in zip(Ss,vals))
    return (f'<svg class="fp5-svg" viewBox="0 0 {w} {h+18}" style="max-width:260px" role="img" aria-label="{title} payoff at expiration">'
      f'<text x="{w/2}" y="14" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">{title}</text>'
      f'<line x1="{l}" y1="{yy(0):.1f}" x2="{r}" y2="{yy(0):.1f}" stroke="currentColor" stroke-opacity=".5"/>'
      f'<line x1="{xx(50):.1f}" y1="{t}" x2="{xx(50):.1f}" y2="{b}" stroke="currentColor" stroke-dasharray="3 4" stroke-opacity=".5"/>'
      f'<polyline fill="none" stroke="{color}" stroke-width="3" points="{pts}"/>'
      f'<text x="{xx(50)+3:.1f}" y="{b+12}" font-size="10" fill="currentColor">K = 50</text>'
      f'<text x="{l}" y="{h+2}" font-size="10.5" fill="currentColor">{note}</text></svg>')
g='#16a34a'; rd='#dc2626'
out['opt']=''.join([
 mini('Long call',lambda s:pay('call','long',s),g,54,'BE 54 · max loss 4 · gain unlimited'),
 mini('Short call',lambda s:pay('call','short',s),rd,54,'BE 54 · max gain 4 · loss unlimited'),
 mini('Long put',lambda s:pay('put','long',s,pr=3),g,47,'BE 47 · max loss 3 · max gain 47'),
 mini('Short put',lambda s:pay('put','short',s,pr=3),rd,47,'BE 47 · max gain 3 · max loss 47'),
 mini('Covered call (stock bought at 50)',lambda s:(s-50)+pay('call','short',s),'#7c3aed',46,'BE 46 · capped at +4 above 50'),
 mini('Protective put (stock bought at 50)',lambda s:(s-50)+pay('put','long',s,pr=3),'#0891b2',53,'BE 53 · floor −3 · upside open')])
assert pay('call','long',60)==6 and pay('put','long',40,pr=3)==7 and pay('call','short',60)==-6
l,r,t,b=48,500,20,262
xx=lambda s:l+s/30*(r-l); yy=lambda v:b-v/16*(b-t)
pts=[]
for i in range(0,101):
    w=i/100; m=w*13+(1-w)*4; sd=math.sqrt((w*25)**2+((1-w)*5)**2+2*w*(1-w)*0.2*25*5); pts.append((sd,m))
mv=min(pts); eff=[p for p in pts if p[1]>=mv[1]]; ineff=[p for p in pts if p[1]<=mv[1]]
rf=3; tp=max(eff,key=lambda p:(p[1]-rf)/p[0]); sl=(tp[1]-rf)/tp[0]
cml=f'{xx(0):.1f},{yy(rf):.1f} {xx(28):.1f},{yy(rf+sl*28):.1f}'
out['frontier']=(f'<svg class="fp5-svg" viewBox="0 0 520 300" role="img" aria-label="Efficient frontier with the capital market line tangent at the market portfolio">'+axes('Risk — standard deviation σ','Expected return')+
 f'<polyline fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="2" stroke-dasharray="4 4" points="{" ".join(f"{xx(s):.1f},{yy(m):.1f}" for s,m in ineff)}"/>'
 f'<polyline fill="none" stroke="#2563eb" stroke-width="3" points="{" ".join(f"{xx(s):.1f},{yy(m):.1f}" for s,m in eff)}"/>'
 f'<polyline fill="none" stroke="#e11d48" stroke-width="2.5" points="{cml}"/>'
 f'<circle cx="{xx(tp[0]):.1f}" cy="{yy(tp[1]):.1f}" r="5" fill="#e11d48"/><text x="{xx(tp[0])+8:.1f}" y="{yy(tp[1])+16:.1f}" font-size="12" fill="#e11d48">M (market portfolio)</text>'
 f'<circle cx="{xx(0):.1f}" cy="{yy(rf):.1f}" r="4" fill="currentColor"/><text x="{xx(0)+6:.1f}" y="{yy(rf)-6:.1f}" font-size="12" fill="currentColor">Rf</text>'
 f'<text x="{xx(19):.1f}" y="{yy(15.2):.1f}" font-size="12" fill="#e11d48">CML</text>'
 f'<text x="{xx(20.5):.1f}" y="{yy(10.2):.1f}" font-size="12" fill="#2563eb">efficient frontier</text>'
 f'<text x="{xx(6.5):.1f}" y="{yy(2.2):.1f}" font-size="11" fill="currentColor" fill-opacity=".6">inefficient (below the minimum-variance point)</text></svg>')
xs=lambda bb:l+bb/2*(r-l); ys2=lambda v:b-v/18*(b-t)
out['sml']=(f'<svg class="fp5-svg" viewBox="0 0 520 300" role="img" aria-label="Security market line: required return rises linearly with beta">'+axes('Beta β (0 → 2)','Required return')+
 f'<line x1="{xs(0):.1f}" y1="{ys2(3):.1f}" x2="{xs(2):.1f}" y2="{ys2(3+2*7):.1f}" stroke="#7c3aed" stroke-width="3"/>'
 f'<circle cx="{xs(1):.1f}" cy="{ys2(10):.1f}" r="5" fill="#7c3aed"/><text x="{xs(1)+8:.1f}" y="{ys2(10)+16:.1f}" font-size="12" fill="#7c3aed">market: β 1, Rm 10%</text>'
 f'<circle cx="{xs(1.4):.1f}" cy="{ys2(15.5):.1f}" r="5" fill="#16a34a"/><text x="{xs(1.4)-150:.1f}" y="{ys2(15.5)-6:.1f}" font-size="12" fill="#16a34a">above SML → undervalued (+α)</text>'
 f'<circle cx="{xs(0.7):.1f}" cy="{ys2(5.5):.1f}" r="5" fill="#dc2626"/><text x="{xs(0.7)+8:.1f}" y="{ys2(5.5)+16:.1f}" font-size="12" fill="#dc2626">below SML → overvalued (−α)</text>'
 f'<text x="{xs(0)+6:.1f}" y="{ys2(3)-6:.1f}" font-size="12" fill="currentColor">Rf 3%</text></svg>')
json.dump(out,open('content/fp513/visuals.json','w'))
print('wrote content/fp513/visuals.json')

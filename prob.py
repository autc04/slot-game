def prob(bias):
    if bias < 0:
        return prob(0) * (1 + bias * 0.1)
    
    return (5/6 * (1-((2/3) ** (bias+1))) * (1-((2/3) ** (bias+1)))
        + 1/6 * 5/6 * (1-((2/3) ** (bias+1)))
        + 1/6 * 1/6 * (1-((1/6) ** (bias+1))))
    

print(f"{'Bias':>6} | {'Probability':>12} | {'Percentage':>10}")
print("-" * 35)
for i in range(-10, 11):
    p = prob(i)
    print(f"{i:>6} | {p:>12.6f} | {p*100:>9.4f}%")